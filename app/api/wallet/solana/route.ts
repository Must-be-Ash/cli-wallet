import { NextRequest, NextResponse } from "next/server";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * POST /api/wallet/solana
 * Creates a new Solana account on Solana Devnet/Mainnet
 *
 * Returns:
 * - address: The Solana wallet address (public key)
 * - privateKey: The private key for the wallet
 * - network: The network the wallet was created on
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize CDP client
    const cdp = getCdpClient();

    // Create a new Solana account
    const account = await cdp.solana.createAccount();

    console.log(`[Solana] Created account: ${account.address}`);

    // Export the private key for the account
    const privateKey = await cdp.solana.exportAccount({
      address: account.address,
    });

    console.log(`[Solana] Exported private key for: ${account.address}`);

    // Return the wallet credentials
    return NextResponse.json(
      {
        success: true,
        accountType: "solana",
        address: account.address,
        privateKey: privateKey,
        network: "solana-mainnet",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Solana] Error creating wallet:", error);

    // Determine error message
    let errorMessage = "Failed to create Solana wallet";
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
        accountType: "solana",
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/wallet/solana
 * Returns information about the Solana wallet endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/wallet/solana",
    method: "POST",
    description: "Creates a new Solana account on Solana network",
    returns: {
      success: "boolean",
      accountType: "string",
      address: "string",
      privateKey: "string",
      network: "string",
    },
    notes: [
      "Solana accounts work on Solana blockchain",
      "Private key should be stored securely by the user",
      "This is a simple wallet controlled directly by a private key",
    ],
  });
}
