import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/server/rate-limiter";
import { verifyEdgeToken } from "./lib/server/jwt-edge";

// Public unauthenticated routes
const PUBLIC_AUTH_PATHS = ["/login", "/register", "/verify", "/unauthorized"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static asset bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Specialized API v1 Rate Limiting & Auth Check
  if (pathname.startsWith("/api/v1/")) {
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

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(check.limit));
    response.headers.set("X-RateLimit-Remaining", String(check.remaining));
    response.headers.set("X-RateLimit-Reset", String(check.resetSeconds));
    response.headers.set("X-RateLimit-Plan", check.plan);
    return response;
  }

  // 3. Allow internal Auth API routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // 4. Session & Access Token Verification (Edge Runtime)
  let token = request.cookies.get("accessToken")?.value;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  const userPayload = token ? await verifyEdgeToken(token) : null;
  const isAuthenticated = Boolean(userPayload);
  const isPublicAuthPath = PUBLIC_AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // 5. AUTH GATEWAY FIRST: If NOT authenticated
  if (!isAuthenticated) {
    // If requesting a public auth page (login/register/verify), allow access
    if (isPublicAuthPath) {
      return NextResponse.next();
    }

    // Intercept Landing Page (/) and any protected route -> Redirect to /login
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("returnUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 6. IF AUTHENTICATED
  // If authenticated user attempts to access /login or /register, redirect to appropriate role destination
  if (pathname === "/login" || pathname === "/register") {
    if (userPayload?.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/super-admin", request.url));
    }
    if (userPayload?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 7. RBAC MIDDLEWARE GATE
  // Admin Workspace Protection: Only ADMIN or SUPER_ADMIN
  if (pathname.startsWith("/admin")) {
    if (userPayload?.role !== "ADMIN" && userPayload?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Super Admin Workspace Protection: Only SUPER_ADMIN
  if (pathname.startsWith("/super-admin")) {
    if (userPayload?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 8. Forward with user claims in request headers
  const requestHeaders = new Headers(request.headers);
  if (userPayload) {
    requestHeaders.set("x-user-id", userPayload.userId);
    requestHeaders.set("x-user-role", userPayload.role);
    requestHeaders.set("x-user-email", userPayload.email);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
