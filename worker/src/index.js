export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(env)
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, env);
    }

    // Origin check
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
    if (allowed.length > 0 && allowed[0] !== "" && !allowed.includes(origin)) {
      return jsonResponse({ error: "Forbidden" }, 403, env);
    }

    // Simple rate limiting via CF headers
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitKey = `rl:${ip}`;
    const currentCount = parseInt(await env.RATE_LIMIT?.get(rateLimitKey) || "0");
    const maxRequests = parseInt(env.MAX_REQUESTS_PER_MINUTE || "30");

    if (currentCount >= maxRequests) {
      return jsonResponse({ error: "Rate limited. Try again later." }, 429, env);
    }

    if (env.RATE_LIMIT) {
      await env.RATE_LIMIT.put(rateLimitKey, String(currentCount + 1), { expirationTtl: 60 });
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
        }, apiRes.status, env);
      }

      // Normalize Gemini response to Anthropic format
      if (provider === "gemini") {
        const text = extractGeminiText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env);
      }

      // Normalize xAI response to Anthropic format (OpenAI-compatible)
      if (provider === "xai") {
        const text = extractOpenRouterText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env);
      }

      // Normalize OpenRouter response to Anthropic format
      if (provider === "openrouter") {
        const text = extractOpenRouterText(data);
        if (!text) {
          return jsonResponse({
            error: extractUpstreamError(data) || "Upstream API returned no text content."
          }, 502, env);
        }

        return jsonResponse({
          content: [{ type: "text", text }]
        }, 200, env);
      }

      return jsonResponse(data, apiRes.status, env);

    } catch (err) {
      return jsonResponse({ error: err.message }, 500, env);
    }
  }
};

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env)
    }
  });
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
