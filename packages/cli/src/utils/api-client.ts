import axios, { AxiosError } from "axios";

/**
 * API base URL from environment or default to production
 */
const API_URL = process.env.API_URL || "https://add-wallet.vercel.app";

/**
 * Response structure for EOA wallet creation
 */
export interface EOAWalletResponse {
  success: boolean;
  accountType: "eoa";
  address: string;
  privateKey: string;
  network: string;
}

/**
 * Response structure for Smart Account wallet creation
 */
export interface SmartAccountResponse {
  success: boolean;
  accountType: "smart-account";
  smartAccountAddress: string;
  ownerAddress: string;
  ownerPrivateKey: string;
  network: string;
  note?: string;
}

/**
 * Response structure for Solana wallet creation
 */
export interface SolanaWalletResponse {
  success: boolean;
  accountType: "solana";
  address: string;
  privateKey: string;
  network: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: string;
  accountType?: string;
}

/**
 * Request structure for onramp session creation
 */
export interface OnrampSessionRequest {
  address: string;
  presetAmount?: string;
  blockchain?: "base" | "solana";
}

/**
 * Response structure for onramp session creation
 */
export interface OnrampSessionResponse {
  success: boolean;
  onrampUrl: string;
  expiresIn?: string;
}

/**
 * Request structure for testnet faucet
 */
export interface FaucetRequest {
  address: string;
  blockchain?: "evm" | "solana";
}

/**
 * Response structure for testnet faucet
 */
export interface FaucetResponse {
  success: boolean;
  transactionHash: string;
  network: string;
  token: string;
  amount: string;
  explorerUrl: string;
}

/**
 * Create an EOA wallet
 */
export async function createEOAWallet(): Promise<EOAWalletResponse> {
  try {
    const response = await axios.post<EOAWalletResponse>(
      `${API_URL}/api/wallet/eoa`,
      {},
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}

/**
 * Create a Smart Account wallet
 */
export async function createSmartAccountWallet(): Promise<SmartAccountResponse> {
  try {
    const response = await axios.post<SmartAccountResponse>(
      `${API_URL}/api/wallet/smart-account`,
      {},
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}

/**
 * Create a Solana wallet
 */
export async function createSolanaWallet(): Promise<SolanaWalletResponse> {
  try {
    const response = await axios.post<SolanaWalletResponse>(
      `${API_URL}/api/wallet/solana`,
      {},
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}

/**
 * Create an onramp session and get onramp URL
 */
export async function createOnrampSession(
  request: OnrampSessionRequest
): Promise<OnrampSessionResponse> {
  try {
    const response = await axios.post<OnrampSessionResponse>(
      `${API_URL}/api/onramp/session`,
      request,
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}

/**
 * Request testnet USDC from the faucet
 */
export async function requestTestnetFaucet(
  request: FaucetRequest
): Promise<FaucetResponse> {
  try {
    const response = await axios.post<FaucetResponse>(
      `${API_URL}/api/faucet/testnet`,
      request,
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error);
  }
}

/**
 * Handle API errors and convert to user-friendly messages
 */
function handleAPIError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;

    // Network error
    if (!axiosError.response) {
      return new Error(
        "Unable to connect to the wallet API. Please check your internet connection and try again."
      );
    }

    // Server returned error response
    if (axiosError.response.data && axiosError.response.data.error) {
      return new Error(axiosError.response.data.error);
    }

    // HTTP error
    if (axiosError.response.status >= 500) {
      return new Error(
        "The wallet service is temporarily unavailable. Please try again later."
      );
    }

    if (axiosError.response.status === 429) {
      return new Error(
        "Too many requests. Please wait a moment and try again."
      );
    }

    return new Error(
      `API request failed with status ${axiosError.response.status}`
    );
  }

  // Unknown error
  return new Error(
    error instanceof Error ? error.message : "An unexpected error occurred"
  );
}
