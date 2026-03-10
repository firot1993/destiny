import { DurableObject } from "cloudflare:workers";

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(env)
      });
    }

    if (request.method !== "POST") {
      const dailyState = await getDailyLimitState(env);
      return jsonResponse({ error: "Method not allowed" }, 405, env, buildDailyHeaders(dailyState.limit, dailyState.remaining));
    }

    // Origin check
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
    if (allowed.length > 0 && allowed[0] !== "" && !allowed.includes(origin)) {
      const dailyState = await getDailyLimitState(env);
      return jsonResponse({ error: "Forbidden" }, 403, env, buildDailyHeaders(dailyState.limit, dailyState.remaining));
    }

    // Per-IP rate limiting (per minute)
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitKey = `rl:${ip}`;
    const currentCount = parseInt(await env.RATE_LIMIT?.get(rateLimitKey) || "0");
    const maxRequests = parseInt(env.MAX_REQUESTS_PER_MINUTE || "30");

    if (currentCount >= maxRequests) {
      const dailyState = await getDailyLimitState(env);
      return jsonResponse({ error: "Rate limited. Try again later." }, 429, env, buildDailyHeaders(dailyState.limit, dailyState.remaining));
    }

    if (env.RATE_LIMIT) {
      await env.RATE_LIMIT.put(rateLimitKey, String(currentCount + 1), { expirationTtl: 60 });
    }

    const dailyState = await consumeDailyLimit(env);
    const dailyHeaders = buildDailyHeaders(dailyState.limit, dailyState.remaining);
    if (!dailyState.allowed) {
      return jsonResponse({ error: "Daily request limit reached. Try again tomorrow." }, 429, env, dailyHeaders);
    }

    try {
      const body = await request.json();
      const provider = body.provider || "anthropic";
      delete body.provider; // Don't forward this to the API

      let apiUrl, headers, apiBody;

      if (provider === "gemini") {
        const model = body.model || "gemini-3-flash-preview";
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        apiBody = JSON.stringify({
          contents: (body.messages || []).map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          tools: [{ google_search: {} }]
        });
        headers = {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GOOGLE_API_KEY
        };
      } else if (provider === "xai") {
        apiUrl = "https://api.x.ai/v1/chat/completions";
        const messages = (body.messages || []).map(m => ({
          role: m.role,
          content: m.content
        }));
        apiBody = JSON.stringify({
          model: body.model || "grok-4-1-fast-non-reasoning",
          max_tokens: body.max_tokens || 1000,
          temperature: body.temperature ?? 1.0,
          messages
        });
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.XAI_API_KEY}`
        };
      } else if (provider === "openrouter") {
        apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        // Map Anthropic format → OpenAI format for OpenRouter
        const messages = (body.messages || []).map(m => ({
          role: m.role,
          content: m.content
        }));
        apiBody = JSON.stringify({
          model: body.model || "anthropic/claude-sonnet-4-20250514",
          max_tokens: body.max_tokens || 1000,
          temperature: body.temperature ?? 1.0,
          messages
        });
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": env.SITE_URL || origin,
          "X-Title": "Life Trajectory Diffusion"
        };
      } else {
        // Default: Anthropic direct
        apiUrl = "https://api.anthropic.com/v1/messages";
        apiBody = JSON.stringify({
          model: body.model || "claude-sonnet-4-20250514",
          max_tokens: body.max_tokens || 1000,
          temperature: body.temperature ?? 1.0,
          messages: body.messages || []
        });
        headers = {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        };
      }

      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: apiBody
      });

      const { data, rawText } = await parseJsonResponse(apiRes);

      if (!apiRes.ok) {
        return jsonResponse({
          error: extractUpstreamError(data) || rawText.slice(0, 300) || `Upstream API error (${apiRes.status})`
        }, apiRes.status, env, dailyHeaders);
      }

      // Normalize Gemini response to Anthropic format
      if (provider === "gemini") {
        const text = extractGeminiText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env, dailyHeaders);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env, dailyHeaders);
      }

      // Normalize xAI response to Anthropic format (OpenAI-compatible)
      if (provider === "xai") {
        const text = extractOpenRouterText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env, dailyHeaders);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env, dailyHeaders);
      }

      // Normalize OpenRouter response to Anthropic format
      if (provider === "openrouter") {
        const text = extractOpenRouterText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env, dailyHeaders);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env, dailyHeaders);
      }

      return jsonResponse(data, apiRes.status, env, dailyHeaders);

    } catch (err) {
      return jsonResponse({ error: err.message }, 500, env, dailyHeaders);
    }
  }
};

export class DailyLimitDurableObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.count = 0;
    this.initialized = ctx.blockConcurrencyWhile(async () => {
      const storedCount = await this.ctx.storage.get("count");
      this.count = typeof storedCount === "number" ? storedCount : 0;
    });
  }

  async fetch(request) {
    await this.initialized;

    const url = new URL(request.url);
    const limit = parsePositiveInt(url.searchParams.get("limit")) || parsePositiveInt(this.env.MAX_REQUESTS_PER_DAY) || 1000;

    if (request.method === "GET" && url.pathname === "/status") {
      return internalJsonResponse({
        allowed: this.count < limit,
        limit,
        remaining: Math.max(0, limit - this.count)
      });
    }

    if (request.method === "POST" && url.pathname === "/consume") {
      if (this.count >= limit) {
        return internalJsonResponse({
          allowed: false,
          limit,
          remaining: 0
        });
      }

      this.count += 1;
      await this.ctx.storage.put("count", this.count);

      return internalJsonResponse({
        allowed: true,
        limit,
        remaining: Math.max(0, limit - this.count)
      });
    }

    return internalJsonResponse({ error: "Not found" }, 404);
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Expose-Headers": "X-Daily-Remaining, X-Daily-Limit"
  };
}

function jsonResponse(data, status, env, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...extraHeaders
    }
  });
}

async function getDailyLimitState(env) {
  return callDailyLimitDurableObject(env, "status");
}

async function consumeDailyLimit(env) {
  return callDailyLimitDurableObject(env, "consume", { method: "POST" });
}

async function callDailyLimitDurableObject(env, action, init) {
  if (!env.DAILY_LIMITER) {
    throw new Error("DAILY_LIMITER Durable Object binding is not configured.");
  }

  const maxDaily = parsePositiveInt(env.MAX_REQUESTS_PER_DAY) || 1000;
  const stub = env.DAILY_LIMITER.getByName(getUtcDateKey());
  const response = await stub.fetch(`https://daily-limit/${action}?limit=${maxDaily}`, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Daily limit service request failed.");
  }

  return {
    allowed: Boolean(data?.allowed),
    limit: parsePositiveInt(data?.limit) || maxDaily,
    remaining: Math.max(0, parseInt(data?.remaining || "0", 10))
  };
}

function buildDailyHeaders(maxDaily, dailyRemaining) {
  return {
    "X-Daily-Remaining": String(Math.max(0, dailyRemaining)),
    "X-Daily-Limit": String(maxDaily)
  };
}

async function parseJsonResponse(response) {
  const rawText = await response.text();
  if (!rawText) return { data: null, rawText: "" };

  try {
    return { data: JSON.parse(rawText), rawText };
  } catch {
    return { data: null, rawText };
  }
}

function getUtcDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function internalJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function parsePositiveInt(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function extractUpstreamError(data) {
  if (!data) return "";
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error?.message === "string") return data.error.message;
  return "";
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter(p => typeof p.text === "string")
    .map(p => p.text)
    .join("\n")
    .trim();
}

function extractOpenRouterText(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part.text === "string") return part.text;
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}
