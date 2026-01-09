import { createOnrampSession } from "./api-client.js";

/**
 * Generate Coinbase Pay onramp URL for funding a wallet with USDC
 * Uses backend API to create a session-based onramp URL with session token
 *
 * @param address - The wallet address to fund
 * @param presetAmount - Optional USD amount to preset (e.g., "100")
 * @returns Complete Coinbase Pay URL with session token
 */
export async function generateOnrampURL(
  address: string,
  presetAmount?: string
): Promise<string> {
  // Call backend API to create onramp session
  const response = await createOnrampSession({
    address,
    presetAmount,
  });

  return response.onrampUrl;
}

/**
 * Display onramp instructions with funding link
 *
 * @param address - The wallet address to fund
 * @param presetAmount - Optional USD amount to preset (e.g., "100")
 */
export async function displayOnrampInstructions(
  address: string,
  presetAmount?: string
): Promise<void> {
  const onrampURL = await generateOnrampURL(address, presetAmount);

  console.log("\n💰 Fund Your Wallet:\n");
  console.log("To add USDC to your wallet, use Coinbase Pay:\n");
  console.log(onrampURL);
  console.log(
    "\nThis link will open Coinbase Pay where you can purchase USDC"
  );
  console.log("and send it directly to your new wallet address.\n");

  if (presetAmount) {
    console.log(
      `💡 The link is pre-filled with $${presetAmount} for quick checkout.\n`
    );
  }
}
