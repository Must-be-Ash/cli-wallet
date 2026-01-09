import { CdpClient } from "@coinbase/cdp-sdk";

/**
 * Validates that all required CDP environment variables are set
 * @throws Error if any required environment variable is missing
 */
function validateEnvironmentVariables(): void {
  const requiredEnvVars = [
    "CDP_API_KEY_ID",
    "CDP_API_KEY_SECRET",
    "CDP_WALLET_SECRET",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
        `Please check your .env file and ensure all CDP credentials are set.`
    );
  }
}

/**
 * Singleton CDP Client instance
 * The CdpClient automatically loads credentials from environment variables:
 * - CDP_API_KEY_ID
 * - CDP_API_KEY_SECRET
 * - CDP_WALLET_SECRET
 */
let cdpClientInstance: CdpClient | null = null;

/**
 * Gets or creates the CDP Client singleton instance
 * @returns CdpClient instance
 * @throws Error if environment variables are not set
 */
export function getCdpClient(): CdpClient {
  // Validate environment variables on first access
  if (!cdpClientInstance) {
    validateEnvironmentVariables();
    cdpClientInstance = new CdpClient();
  }

  return cdpClientInstance;
}

/**
 * Resets the CDP Client singleton (useful for testing)
 */
export function resetCdpClient(): void {
  cdpClientInstance = null;
}
