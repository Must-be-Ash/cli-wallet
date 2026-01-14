import { NextRequest, NextResponse } from "next/server";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * Request body for testnet faucet
 */
interface FaucetRequest {
  address: string;
  blockchain?: "evm" | "solana";
}

/**
 * POST /api/faucet/testnet
 * Requests testnet USDC from the CDP Faucet API for Base Sepolia
 *
 * This endpoint uses the CDP Faucet API to claim testnet USDC
 * on Base Sepolia network for testing purposes.
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize CDP client
    const cdp = getCdpClient();

    // Parse request body
    const body: FaucetRequest = await request.json();
    const { address, blockchain = "evm" } = body;

    // Validate required fields
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: address",
        },
        { status: 400 }
      );
    }

    // Validate address format based on blockchain
    if (blockchain === "solana") {
      // Basic Solana address validation
      if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid Solana address format",
          },
          { status: 400 }
        );
      }
    } else {
      // EVM address validation
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid EVM wallet address format",
          },
          { status: 400 }
        );
      }
    }

    if (blockchain === "solana") {
      console.log(`[FAUCET] Requesting testnet USDC for Solana: ${address}`);

      // Request USDC from faucet on Solana Devnet
      const { signature } = await cdp.solana.requestFaucet({
        address: address,
        token: "usdc",
      });

      console.log(`[FAUCET] Transaction signature: ${signature}`);

      // Return success response for Solana
      return NextResponse.json(
        {
          success: true,
          transactionHash: signature,
          network: "solana-devnet",
          token: "usdc",
          amount: "1 USDC",
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        },
        { status: 200 }
      );
    } else {
      console.log(`[FAUCET] Requesting testnet USDC for EVM: ${address}`);

      // Request USDC from faucet on Base Sepolia
      const faucetResponse = await cdp.evm.requestFaucet({
        address: address,
        network: "base-sepolia",
        token: "usdc",
      });

      console.log(`[FAUCET] Transaction hash: ${faucetResponse.transactionHash}`);

      // Return success response for EVM
      return NextResponse.json(
        {
          success: true,
          transactionHash: faucetResponse.transactionHash,
          network: "base-sepolia",
          token: "usdc",
          amount: "1 USDC",
          explorerUrl: `https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`,
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("[FAUCET] Error requesting testnet funds:", error);

    // Handle different error types
    let errorMessage = "Failed to request testnet funds";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for specific error types
      if (errorMessage.includes("rate limit")) {
        statusCode = 429;
        errorMessage = "Rate limit exceeded. Please try again in 24 hours.";
      } else if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
        statusCode = 401;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/faucet/testnet
 * Returns information about the testnet faucet endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/faucet/testnet",
    method: "POST",
    description: "Requests testnet USDC from CDP Faucet for Base Sepolia",
    parameters: {
      address: "string (required) - EVM wallet address",
    },
    returns: {
      success: "boolean",
      transactionHash: "string",
      network: "string",
      token: "string",
      amount: "string",
      explorerUrl: "string",
    },
    notes: [
      "USDC claim limits are 10 claims per 24 hours",
      "Each claim provides 1 testnet USDC on Base Sepolia",
      "Transaction can be verified on Base Sepolia block explorer",
    ],
    limits: {
      network: "base-sepolia",
      token: "usdc",
      claimsPerDay: 10,
      amountPerClaim: "1 USDC",
    },
  });
}
