import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { getCdpClient } from "@/lib/cdp-client";

/**
 * Request body for creating an onramp session
 */
interface OnrampSessionRequest {
  address: string;
  presetAmount?: string;
  blockchain?: "base" | "solana";
}

/**
 * POST /api/onramp/session
 * Create an onramp session and return a ready-to-use onramp URL
 *
 * This endpoint generates a Coinbase Pay onramp URL with a session token
 * that allows users to purchase USDC on Base network and send it to the
 * specified wallet address.
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize CDP Client
    const cdp = getCdpClient();

    // Parse request body
    const body: OnrampSessionRequest = await request.json();
    const { address, presetAmount, blockchain = "base" } = body;

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
      // Basic Solana address validation (base58, typically 32-44 characters)
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

    // Build onramp session parameters
    const sessionParams: {
      destinationAddress: string;
      purchaseCurrency: string;
      destinationNetwork: string;
      paymentAmount?: string;
      paymentCurrency?: string;
    } = {
      destinationAddress: address,
      purchaseCurrency: blockchain === "solana" ? "SOL" : "USDC",
      destinationNetwork: blockchain,
    };

    // Add optional preset amount for one-click-buy experience
    if (presetAmount) {
      sessionParams.paymentAmount = presetAmount;
      sessionParams.paymentCurrency = "USD";
    }

    // Generate JWT for authentication
    const apiKeyId = process.env.CDP_API_KEY_ID;
    const apiKeySecret = process.env.CDP_API_KEY_SECRET;

    if (!apiKeyId || !apiKeySecret) {
      throw new Error("CDP API credentials not configured");
    }

    const jwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod: "POST",
      requestHost: "api.developer.coinbase.com",
      requestPath: "/onramp/v1/token",
    });

    // First, generate session token using the Session Token API
    const tokenResponse = await axios.post(
      "https://api.developer.coinbase.com/onramp/v1/token",
      {
        addresses: [
          {
            address: sessionParams.destinationAddress,
            blockchains: [sessionParams.destinationNetwork],
          },
        ],
        assets: [sessionParams.purchaseCurrency],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    // Log response for debugging
    console.log("[ONRAMP] Token API response:", JSON.stringify(tokenResponse.data, null, 2));

    const sessionToken = tokenResponse.data?.data?.token || tokenResponse.data?.token;

    if (!sessionToken) {
      console.error("[ONRAMP] Failed to extract token from response:", tokenResponse.data);
      throw new Error("Session token not found in response");
    }

    console.log("[ONRAMP] Successfully generated session token");

    // Build one-click-buy onramp URL with session token and parameters
    // Use /buy endpoint for one-click-buy with preset amount
    const urlParams = new URLSearchParams({
      sessionToken,
      defaultAsset: sessionParams.purchaseCurrency,
    });

    // Add preset amount parameters for one-click-buy experience
    if (sessionParams.paymentAmount && sessionParams.paymentCurrency) {
      urlParams.append("presetFiatAmount", sessionParams.paymentAmount);
      urlParams.append("fiatCurrency", sessionParams.paymentCurrency);
    }

    // Note: Using /buy instead of /buy/select-asset for one-click-buy with preset amount
    const onrampUrl = `https://pay.coinbase.com/buy?${urlParams.toString()}`;

    // Return success response with onramp URL
    return NextResponse.json(
      {
        success: true,
        onrampUrl: onrampUrl,
        expiresIn: "5 minutes",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error creating onramp session:", error);

    // Handle different error types
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while creating onramp session",
      },
      { status: 500 }
    );
  }
}
