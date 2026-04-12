import type { LLMRequest, AnthropicResponse } from "@/types";

interface UpstreamError {
  error?: string | { message?: string };
  message?: string;
}

function extractUpstreamError(data: UpstreamError | null): string {
  if (!data) return "";
  if (typeof data.error === "string") return data.error;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error?.message === "string") return data.error.message;
  return "";
}

function extractGeminiText(data: Record<string, unknown>): string {
  const candidates = data?.candidates as Array<{
    content?: { parts?: Array<{ text?: string }> };
  }> | undefined;
  const parts = candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p) => typeof p.text === "string")
    .map((p) => p.text as string)
    .join("\n")
    .trim();
}

function extractOpenRouterText(
  data: Record<string, unknown>
): string {
  const choices = data?.choices as Array<{
    message?: { content?: string | Array<{ type?: string; text?: string }> };
  }> | undefined;
  const content = choices?.[0]?.message?.content;
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

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export async function callProvider(req: LLMRequest): Promise<AnthropicResponse> {
  const { provider, ...body } = req as LLMRequest & { provider: string };

  let apiUrl: string;
  let headers: Record<string, string>;
  let apiBody: string;

  if (provider === "gemini") {
    const model = body.model || "gemini-3-flash-preview";
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    apiBody = JSON.stringify({
      contents: (body.messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      tools: [{ google_search: {} }],
    });
    headers = {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GOOGLE_API_KEY ?? "",
    };
  } else if (provider === "xai") {
    apiUrl = "https://api.x.ai/v1/chat/completions";
    apiBody = JSON.stringify({
      model: body.model || "grok-4-1-fast-non-reasoning",
      max_tokens: body.max_tokens || 1000,
      temperature: body.temperature ?? 1.0,
      messages: (body.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.XAI_API_KEY ?? ""}`,
    };
  } else if (provider === "openrouter") {
    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    apiBody = JSON.stringify({
      model: body.model || "anthropic/claude-sonnet-4-20250514",
      max_tokens: body.max_tokens || 1000,
      temperature: body.temperature ?? 1.0,
      messages: (body.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      "HTTP-Referer": process.env.SITE_URL || "https://localhost:3000",
      "X-Title": "Life Trajectory Diffusion",
    };
  } else {
    // Default: Anthropic direct
    apiUrl = "https://api.anthropic.com/v1/messages";
    apiBody = JSON.stringify({
      model: body.model || "claude-sonnet-4-20250514",
      max_tokens: body.max_tokens || 1000,
      temperature: body.temperature ?? 1.0,
      messages: body.messages || [],
    });
    headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    };
  }

  const apiRes = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: apiBody,
  });

  const rawText = await apiRes.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    // non-JSON upstream error
  }

  if (!apiRes.ok) {
    const msg =
      extractUpstreamError(data as UpstreamError | null) ||
      rawText.slice(0, 300) ||
      `Upstream API error (${apiRes.status})`;
    throw new ProviderError(msg, apiRes.status);
  }

  if (provider === "gemini") {
    const text = data ? extractGeminiText(data) : "";
    if (!text) {
      throw new ProviderError(
        extractUpstreamError(data as UpstreamError | null) ||
          "Upstream API returned no text content.",
        502
      );
    }
    return { content: [{ type: "text", text }] };
  }

  if (provider === "xai" || provider === "openrouter") {
    const text = data ? extractOpenRouterText(data) : "";
    if (!text) {
      throw new ProviderError(
        extractUpstreamError(data as UpstreamError | null) ||
          "Upstream API returned no text content.",
        502
      );
    }
    return { content: [{ type: "text", text }] };
  }

  // Anthropic: return as-is
  return data as unknown as AnthropicResponse;
}
