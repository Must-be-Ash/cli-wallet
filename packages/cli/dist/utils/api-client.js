import axios from "axios";
/**
 * API base URL from environment or default to production
 */
const API_URL = process.env.API_URL || "https://add-wallet.vercel.app";
/**
 * Create an EOA wallet
 */
export async function createEOAWallet() {
    try {
        const response = await axios.post(`${API_URL}/api/wallet/eoa`, {}, {
            timeout: 30000, // 30 second timeout
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleAPIError(error);
    }
}
/**
 * Create a Smart Account wallet
 */
export async function createSmartAccountWallet() {
    try {
        const response = await axios.post(`${API_URL}/api/wallet/smart-account`, {}, {
            timeout: 30000, // 30 second timeout
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleAPIError(error);
    }
}
/**
 * Create an onramp session and get onramp URL
 */
export async function createOnrampSession(request) {
    try {
        const response = await axios.post(`${API_URL}/api/onramp/session`, request, {
            timeout: 30000, // 30 second timeout
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleAPIError(error);
    }
}
/**
 * Request testnet USDC from the faucet
 */
export async function requestTestnetFaucet(request) {
    try {
        const response = await axios.post(`${API_URL}/api/faucet/testnet`, request, {
            timeout: 30000, // 30 second timeout
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        throw handleAPIError(error);
    }
}
/**
 * Handle API errors and convert to user-friendly messages
 */
function handleAPIError(error) {
    if (axios.isAxiosError(error)) {
        const axiosError = error;
        // Network error
        if (!axiosError.response) {
            return new Error("Unable to connect to the wallet API. Please check your internet connection and try again.");
        }
        // Server returned error response
        if (axiosError.response.data && axiosError.response.data.error) {
            return new Error(axiosError.response.data.error);
        }
        // HTTP error
        if (axiosError.response.status >= 500) {
            return new Error("The wallet service is temporarily unavailable. Please try again later.");
        }
        if (axiosError.response.status === 429) {
            return new Error("Too many requests. Please wait a moment and try again.");
        }
        return new Error(`API request failed with status ${axiosError.response.status}`);
    }
    // Unknown error
    return new Error(error instanceof Error ? error.message : "An unexpected error occurred");
}
//# sourceMappingURL=api-client.js.map