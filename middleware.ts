import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/server/rate-limiter";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting and auth checks to /api/v1/* routes
  if (pathname.startsWith("/api/v1/")) {
    // Check for API Key in Header or Query Params
    const authHeader = request.headers.get("authorization");
    const customKeyHeader = request.headers.get("x-api-key");
    const queryKey = request.nextUrl.searchParams.get("apiKey");

    let apiKey = customKeyHeader || queryKey;
    if (!apiKey && authHeader?.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const identifier = apiKey || ip;
    const isApiKey = Boolean(apiKey);

    const check = rateLimiter.checkLimit(identifier, isApiKey);

    // If API key was provided but is invalid or revoked
    if (isApiKey && check.plan === "INVALID_KEY") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or revoked API key provided.",
          code: "INVALID_API_KEY",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer error="invalid_token"',
          },
        }
      );
    }

    // If rate limit exceeded
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded for plan [${check.plan}]. Maximum ${check.limit} requests per minute.`,
          code: "RATE_LIMIT_EXCEEDED",
          retryAfterSeconds: check.resetSeconds,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(check.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(check.resetSeconds),
            "Retry-After": String(check.resetSeconds),
          },
        }
      );
    }

    // Proceed and attach rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(check.limit));
    response.headers.set("X-RateLimit-Remaining", String(check.remaining));
    response.headers.set("X-RateLimit-Reset", String(check.resetSeconds));
    response.headers.set("X-RateLimit-Plan", check.plan);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
