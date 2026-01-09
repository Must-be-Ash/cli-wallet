import { NextRequest, NextResponse } from "next/server";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * POST /api/wallet/eoa
 * Creates a new EOA (Externally Owned Account) on Base Mainnet
 *
 * Returns:
 * - address: The wallet address
 * - privateKey: The private key for the wallet
 * - network: The network the wallet was created on
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize CDP client
    const cdp = getCdpClient();

    // Create a new EOA account
    // By default, this creates an account that can be used on any EVM network
    const account = await cdp.evm.createAccount();

    console.log(`[EOA] Created account: ${account.address}`);

    // Export the private key for the account
    const privateKey = await cdp.evm.exportAccount({
      address: account.address,
    });

    console.log(`[EOA] Exported private key for: ${account.address}`);

    // Return the wallet credentials
    return NextResponse.json(
      {
        success: true,
        accountType: "eoa",
        address: account.address,
        privateKey: privateKey,
        network: "base-mainnet",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EOA] Error creating wallet:", error);

    // Determine error message
    let errorMessage = "Failed to create EOA wallet";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error types
      if (errorMessage.includes("Missing required environment variables")) {
        statusCode = 500; // Server configuration error
      } else if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
        statusCode = 401; // Authentication error
      } else if (errorMessage.includes("rate limit")) {
        statusCode = 429; // Rate limit error
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        accountType: "eoa",
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/wallet/eoa
 * Returns information about the EOA wallet endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/wallet/eoa",
    method: "POST",
    description: "Creates a new EOA (Externally Owned Account) on Base Mainnet",
    returns: {
      success: "boolean",
      accountType: "string",
      address: "string",
      privateKey: "string",
      network: "string",
    },
    notes: [
      "EOA accounts work on all EVM-compatible networks",
      "Private key should be stored securely by the user",
      "This is a simple wallet controlled directly by a private key",
    ],
  });
}
