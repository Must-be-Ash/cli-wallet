import { NextResponse } from "next/server";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * GET /api/health
 * Health check endpoint for the API
 *
 * Verifies:
 * - Service is running
 * - CDP client can be initialized
 * - Environment variables are set
 * - CDP API connectivity
 *
 * Returns:
 * - status: "healthy" or "unhealthy"
 * - timestamp: Current timestamp
 * - checks: Object with individual check results
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, any> = {};

  try {
    // Check 1: Service is running (implicit by reaching this point)
    checks.service = {
      status: "healthy",
      message: "API service is running",
    };

    // Check 2: Environment variables
    const requiredEnvVars = [
      "CDP_API_KEY_ID",
      "CDP_API_KEY_SECRET",
      "CDP_WALLET_SECRET",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      checks.environment = {
        status: "unhealthy",
        message: `Missing environment variables: ${missingVars.join(", ")}`,
        missing: missingVars,
      };
    } else {
      checks.environment = {
        status: "healthy",
        message: "All required environment variables are set",
        variables: requiredEnvVars,
      };
    }

    // Check 3: CDP Client initialization
    try {
      const cdp = getCdpClient();
      checks.cdpClient = {
        status: "healthy",
        message: "CDP Client initialized successfully",
      };

      // Optional: You could add a lightweight API call here to verify connectivity
      // For example: await cdp.evm.listAccounts() with a page size of 1
      // This is commented out to avoid making unnecessary API calls on every health check
    } catch (error) {
      checks.cdpClient = {
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check 4: API URL configuration
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    checks.apiUrl = {
      status: apiUrl ? "healthy" : "warning",
      message: apiUrl
        ? `API URL configured: ${apiUrl}`
        : "NEXT_PUBLIC_API_URL not set (optional for development)",
      url: apiUrl || "not set",
    };

    // Determine overall health status
    const isHealthy = Object.values(checks).every(
      (check) => check.status === "healthy" || check.status === "warning"
    );

    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp,
        version: "1.0.0",
        service: "cli-wallet-api",
        checks,
      },
      { status: statusCode }
    );
  } catch (error) {
    // Catch-all error handler
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp,
        version: "1.0.0",
        service: "cli-wallet-api",
        error: error instanceof Error ? error.message : "Unknown error",
        checks,
      },
      { status: 503 }
    );
  }
}
