import axios, { AxiosError } from "axios";

/**
 * API base URL from environment or default to production
 */
const API_URL = process.env.API_URL || "https://cli-wallet.vercel.app";

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
