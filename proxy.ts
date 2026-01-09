import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for API security and request validation
 * Runs before API route handlers
 */
export function proxy(request: NextRequest) {
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

  // Basic rate limiting check (log suspicious activity)
  // Note: For production, consider using a proper rate limiting service like Upstash or Vercel Edge Config
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
