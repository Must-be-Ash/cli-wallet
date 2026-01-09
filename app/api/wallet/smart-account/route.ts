import { NextRequest, NextResponse } from "next/server";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * POST /api/wallet/smart-account
 * Creates a new Smart Account on Base Mainnet with an EOA owner
 *
 * Smart Accounts provide advanced features like:
 * - Gas sponsorship via paymasters
 * - Batch transactions
 * - EIP-4337 account abstraction
 *
 * Returns:
 * - smartAccountAddress: The Smart Account contract address
 * - ownerAddress: The owner EOA address
 * - ownerPrivateKey: The private key for the owner EOA
 * - network: The network (base-mainnet)
 *
 * Note: Smart Account contract is deployed on first transaction
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize CDP client
    const cdp = getCdpClient();

    console.log("[Smart Account] Creating owner EOA...");

    // Step 1: Create owner EOA first
    // Smart Accounts require an EOA as the owner to sign transactions
    const ownerAccount = await cdp.evm.createAccount();

    console.log(`[Smart Account] Created owner EOA: ${ownerAccount.address}`);

    // Step 2: Create Smart Account with the owner EOA
    // Smart Accounts are only supported on Base Mainnet and Base Sepolia
    const smartAccount = await cdp.evm.createSmartAccount({
      owner: ownerAccount,
    });

    console.log(
      `[Smart Account] Created Smart Account: ${smartAccount.address}`
    );

    // Step 3: Export the owner's private key
    // The user needs this to sign transactions for the Smart Account
    const ownerPrivateKey = await cdp.evm.exportAccount({
      address: ownerAccount.address,
    });

    console.log(
      `[Smart Account] Exported owner private key for: ${ownerAccount.address}`
    );

    // Return both the Smart Account and owner credentials
    return NextResponse.json(
      {
        success: true,
        accountType: "smart-account",
        smartAccountAddress: smartAccount.address,
        ownerAddress: ownerAccount.address,
        ownerPrivateKey: ownerPrivateKey,
        network: "base-mainnet",
        note: "Smart Account will be deployed on first transaction. You must use the owner's private key to sign transactions for this Smart Account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Smart Account] Error creating wallet:", error);

    // Determine error message
    let errorMessage = "Failed to create Smart Account wallet";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error types
      if (errorMessage.includes("Missing required environment variables")) {
        statusCode = 500; // Server configuration error
      } else if (
        errorMessage.includes("API key") ||
        errorMessage.includes("authentication")
      ) {
        statusCode = 401; // Authentication error
      } else if (errorMessage.includes("rate limit")) {
        statusCode = 429; // Rate limit error
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("Base")
      ) {
        statusCode = 400; // Network not supported
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        accountType: "smart-account",
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/wallet/smart-account
 * Returns information about the Smart Account endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/wallet/smart-account",
    method: "POST",
    description:
      "Creates a new Smart Account on Base Mainnet with an EOA owner",
    returns: {
      success: "boolean",
      accountType: "string",
      smartAccountAddress: "string",
      ownerAddress: "string",
      ownerPrivateKey: "string",
      network: "string",
      note: "string",
    },
    features: [
      "Gas sponsorship via paymasters (subsidized on Base Sepolia)",
      "Batch multiple transactions in a single user operation",
      "EIP-4337 account abstraction support",
      "Deployed on first transaction using CREATE2",
    ],
    limitations: [
      "Only available on Base Mainnet and Base Sepolia",
      "One Smart Account per owner EOA",
      "Requires owner EOA private key to sign transactions",
    ],
    notes: [
      "Smart Account contract address is deterministic but not deployed until first transaction",
      "Owner's private key should be stored securely",
      "Use owner's private key to sign all Smart Account transactions",
    ],
  });
}
