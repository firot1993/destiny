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

      if (provider === "openrouter") {
        apiUrl = "https://openrouter.ai/api/v1/chat/completions";
        // Map Anthropic format → OpenAI format for OpenRouter
        const messages = (body.messages || []).map(m => ({
          role: m.role,
          content: m.content
        }));
        apiBody = JSON.stringify({
          model: body.model || "anthropic/claude-sonnet-4-20250514",
          max_tokens: body.max_tokens || 1000,
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

      const data = await apiRes.json();

      // Normalize OpenRouter response to Anthropic format
      if (provider === "openrouter") {
        const text = data.choices?.[0]?.message?.content || "";
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
