import { NextResponse } from "next/server";
import { callProvider, ProviderError } from "@/lib/providers";
import { checkPerIpLimit, checkAndConsumeDaily } from "@/lib/rateLimit";
import type { LLMRequest } from "@/types";

const MAX_REQUESTS_PER_DAY = parseInt(
  process.env.MAX_REQUESTS_PER_DAY ?? "1000",
  10
);

function dailyHeaders(limit: number, remaining: number) {
  return {
    "X-Daily-Limit": String(limit),
    "X-Daily-Remaining": String(Math.max(0, remaining)),
  };
}

export async function POST(request: Request) {
  // Per-IP rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = await checkPerIpLimit(ip);
  if (!ipCheck.allowed) {
    const daily = await checkAndConsumeDaily(MAX_REQUESTS_PER_DAY).catch(() => ({
      allowed: true,
      limit: MAX_REQUESTS_PER_DAY,
      remaining: MAX_REQUESTS_PER_DAY,
    }));
    return NextResponse.json(
      { error: "Rate limited. Try again later." },
      { status: 429, headers: dailyHeaders(daily.limit, daily.remaining) }
    );
  }

  // Global daily limit
  const daily = await checkAndConsumeDaily(MAX_REQUESTS_PER_DAY);
  if (!daily.allowed) {
    return NextResponse.json(
      { error: "Daily request limit reached. Try again tomorrow." },
      { status: 429, headers: dailyHeaders(daily.limit, daily.remaining) }
    );
  }

  let body: LLMRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: dailyHeaders(daily.limit, daily.remaining) }
    );
  }

  try {
    const response = await callProvider(body);
    return NextResponse.json(response, {
      status: 200,
      headers: dailyHeaders(daily.limit, daily.remaining),
    });
  } catch (err) {
    if (err instanceof ProviderError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status, headers: dailyHeaders(daily.limit, daily.remaining) }
      );
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: dailyHeaders(daily.limit, daily.remaining) }
    );
  }
}
