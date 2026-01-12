import { createOnrampSession } from "./api-client.js";
import chalk from "chalk";

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

  // Create a visual box around the funding link
  const boxWidth = 80;
  const horizontalLine = "═".repeat(boxWidth);

  console.log("\n");
  console.log(chalk.cyan("╔" + horizontalLine + "╗"));
  console.log(chalk.cyan("║") + chalk.bold.white(" 🎉 YOUR WALLET IS READY! ".padEnd(boxWidth)) + chalk.cyan("║"));
  console.log(chalk.cyan("╠" + horizontalLine + "╣"));
  console.log(chalk.cyan("║") + "                                                                                ".padEnd(boxWidth) + chalk.cyan("║"));

  // Show wallet address
  console.log(chalk.cyan("║") + chalk.dim("Address: ") + chalk.blue(address.padEnd(boxWidth - 9)) + chalk.cyan("║"));
  console.log(chalk.cyan("║") + "                                                                                ".padEnd(boxWidth) + chalk.cyan("║"));

  // Instruction
  console.log(chalk.cyan("║") + chalk.white("Top up your wallet with link below 👇".padEnd(boxWidth)) + chalk.cyan("║"));
  console.log(chalk.cyan("║") + "                                                                                ".padEnd(boxWidth) + chalk.cyan("║"));

  // Display the URL as a single line (don't wrap - keeps it clickable in terminal)
  console.log(chalk.bold.green.underline(onrampURL));

  console.log(chalk.cyan("║") + "                                                                                ".padEnd(boxWidth) + chalk.cyan("║"));

  // Expiry warning and topup command in orange
  console.log(chalk.cyan("║") + chalk.hex("#FFA500")("Note: it expires in 5 minutes ⌛️".padEnd(boxWidth)) + chalk.cyan("║"));
  console.log(chalk.cyan("║") + chalk.hex("#FFA500")("You can topup your wallet at any time by running 'npx add-wallet topup'".padEnd(boxWidth)) + chalk.cyan("║"));
  console.log(chalk.cyan("║") + chalk.hex("#FFA500")("Get testnet USDC on Base Sepolia by running 'npx add-wallet topup testnet'".padEnd(boxWidth)) + chalk.cyan("║"));
  console.log(chalk.cyan("║") + "                                                                                ".padEnd(boxWidth) + chalk.cyan("║"));
  console.log(chalk.cyan("╚" + horizontalLine + "╝"));
  console.log("\n");
}

/**
 * Wrap text to fit within a specified width
 */
function wrapText(text: string, width: number): string[] {
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < text.length; i += width) {
    lines.push(text.substring(i, i + width));
  }

  return lines;
}
