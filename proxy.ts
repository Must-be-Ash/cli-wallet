import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getResetTimeString } from "@/lib/rate-limiter";

/**
 * Proxy for API security and request validation
 * Runs before API route handlers
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply proxy to API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Log incoming requests (helpful for debugging)
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown IP";
  console.log(`[API] ${request.method} ${pathname} - ${ip}`);

  // Handle OPTIONS requests for CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Validate request method
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        success: false,
        error: `Method ${request.method} not allowed`,
      },
      { status: 405 }
    );
  }

  // Apply rate limiting to wallet creation endpoints
  const walletEndpoints = ["/api/wallet/eoa", "/api/wallet/smart-account"];
  if (walletEndpoints.includes(pathname) && request.method === "POST") {
    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.allowed) {
      const resetTimeString = getResetTimeString(rateLimitResult.resetTime);
      console.warn(
        `[Rate Limit] IP ${ip} exceeded limit for ${pathname}. Reset in ${resetTimeString}`
      );

      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. You can create up to 20 wallets per day.",
          details: {
            limit: 20,
            window: "24 hours",
            resetIn: resetTimeString,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Log remaining requests for monitoring
    console.log(
      `[Rate Limit] IP ${ip} - ${rateLimitResult.remaining} requests remaining`
    );
  }

  // Basic bot detection (log suspicious activity)
  const userAgent = request.headers.get("user-agent") || "unknown";
  if (userAgent.toLowerCase().includes("bot") && !pathname.includes("/health")) {
    console.warn(`[Security] Potential bot detected: ${userAgent} accessing ${pathname}`);
  }

  // Add security headers to response
  const response = NextResponse.next();

  return response;
}

/**
 * Configure which routes the proxy applies to
 */
export const config = {
  matcher: "/api/:path*",
};
