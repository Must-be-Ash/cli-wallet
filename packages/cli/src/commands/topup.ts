import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { displayOnrampInstructions } from "../utils/onramp.js";
import { requestTestnetFaucet } from "../utils/api-client.js";

/**
 * Generate a new onramp funding link for an existing wallet (mainnet)
 */
export async function topupWalletMainnet(): Promise<void> {
  console.log(chalk.bold.cyan("\n┌─────────────────────────────────────┐"));
  console.log(chalk.bold.cyan("│   💰 Top Up Your Wallet 💰          │"));
  console.log(chalk.bold.cyan("└─────────────────────────────────────┘\n"));

  // Try to find wallet address from .env
  const walletAddress = await findWalletAddress();

  let address: string;
  let amount: string;

  if (walletAddress) {
    // Found address in .env - confirm with user
    console.log(chalk.green(`✓ Found wallet address: ${walletAddress}\n`));

    const { useFound } = await inquirer.prompt<{ useFound: boolean }>([
      {
        type: "confirm",
        name: "useFound",
        message: "Use this address?",
        default: true,
      },
    ]);

    if (useFound) {
      address = walletAddress;
    } else {
      // User wants to use a different address
      const { manualAddress } = await inquirer.prompt<{ manualAddress: string }>([
        {
          type: "input",
          name: "manualAddress",
          message: "Enter wallet address:",
          validate: (input: string) => {
            if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
              return "Please enter a valid Ethereum address (0x...)";
            }
            return true;
          },
        },
      ]);
      address = manualAddress;
    }
  } else {
    // No .env found - prompt for address
    console.log(chalk.yellow("No .env file found in current directory.\n"));

    const { manualAddress } = await inquirer.prompt<{ manualAddress: string }>([
      {
        type: "input",
        name: "manualAddress",
        message: "Enter wallet address to fund:",
        validate: (input: string) => {
          if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
            return "Please enter a valid Ethereum address (0x...)";
          }
          return true;
        },
      },
    ]);
    address = manualAddress;
  }

  // Ask for amount
  const { presetAmount } = await inquirer.prompt<{ presetAmount: string }>([
    {
      type: "list",
      name: "presetAmount",
      message: "Select preset amount:",
      choices: [
        { name: "$5 (Quick top-up)", value: "5" },
        { name: "$10", value: "10" },
        { name: "$25", value: "25" },
        { name: "$50", value: "50" },
        { name: "$100", value: "100" },
        { name: "Custom amount", value: "custom" },
      ],
      default: "5",
    },
  ]);

  if (presetAmount === "custom") {
    const { customAmount } = await inquirer.prompt<{ customAmount: string }>([
      {
        type: "input",
        name: "customAmount",
        message: "Enter amount in USD:",
        validate: (input: string) => {
          const num = parseFloat(input);
          if (isNaN(num) || num <= 0) {
            return "Please enter a valid amount";
          }
          return true;
        },
      },
    ]);
    amount = customAmount;
  } else {
    amount = presetAmount;
  }

  // Generate onramp URL
  const spinner = ora({
    text: "Generating funding link...",
    color: "cyan",
  }).start();

  try {
    spinner.succeed(chalk.green("Funding link ready!\n"));
    await displayOnrampInstructions(address, amount);
  } catch (error) {
    spinner.fail(chalk.red("Failed to generate funding link"));
    throw error;
  }
}

/**
 * Request testnet USDC from the faucet for an existing wallet
 */
export async function topupWalletTestnet(): Promise<void> {
  console.log(chalk.bold.magenta("\n┌─────────────────────────────────────┐"));
  console.log(chalk.bold.magenta("│   🚰 Testnet Faucet 🚰              │"));
  console.log(chalk.bold.magenta("└─────────────────────────────────────┘\n"));

  // Try to find wallet address from .env
  const walletAddress = await findWalletAddress();

  let address: string;

  if (walletAddress) {
    // Found address in .env - confirm with user
    console.log(chalk.green(`✓ Found wallet address: ${walletAddress}\n`));

    const { useFound } = await inquirer.prompt<{ useFound: boolean }>([
      {
        type: "confirm",
        name: "useFound",
        message: "Use this address?",
        default: true,
      },
    ]);

    if (useFound) {
      address = walletAddress;
    } else {
      // User wants to use a different address
      const { manualAddress } = await inquirer.prompt<{ manualAddress: string }>([
        {
          type: "input",
          name: "manualAddress",
          message: "Enter wallet address:",
          validate: (input: string) => {
            if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
              return "Please enter a valid Ethereum address (0x...)";
            }
            return true;
          },
        },
      ]);
      address = manualAddress;
    }
  } else {
    // No .env found - prompt for address
    console.log(chalk.yellow("No .env file found in current directory.\n"));

    const { manualAddress } = await inquirer.prompt<{ manualAddress: string }>([
      {
        type: "input",
        name: "manualAddress",
        message: "Enter wallet address to fund:",
        validate: (input: string) => {
          if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
            return "Please enter a valid Ethereum address (0x...)";
          }
          return true;
        },
      },
    ]);
    address = manualAddress;
  }

  // Request testnet funds
  const spinner = ora({
    text: "Requesting testnet USDC from faucet...",
    color: "magenta",
  }).start();

  try {
    const response = await requestTestnetFaucet({ address });

    spinner.succeed(chalk.green("Testnet funds received!\n"));

    // Display transaction details
    console.log(chalk.bold("Transaction Details:"));
    console.log(chalk.dim("─".repeat(50)));
    console.log(chalk.cyan(`Network:    ${response.network}`));
    console.log(chalk.cyan(`Token:      ${response.token}`));
    console.log(chalk.cyan(`Amount:     ${response.amount}`));
    console.log(chalk.dim("─".repeat(50)));
    console.log(chalk.cyan(`Transaction Hash:`));
    console.log(chalk.white(`${response.transactionHash}`));
    console.log(chalk.dim("─".repeat(50)));
    console.log(chalk.cyan(`View on Block Explorer:`));
    console.log(chalk.white.underline(`${response.explorerUrl}\n`));

    // Display usage limits
    console.log(chalk.dim("💡 Note: USDC faucet allows 10 claims per 24 hours"));
    console.log(chalk.dim("   Each claim provides 1 testnet USDC on Base Sepolia\n"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to request testnet funds"));

    // Show more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        console.error(chalk.yellow("\n⚠ Rate limit exceeded!"));
        console.error(chalk.dim("The faucet allows 10 claims per 24 hours."));
        console.error(chalk.dim("Please try again later.\n"));
      } else {
        console.error(chalk.red(`\nError: ${error.message}\n`));
      }
    }

    throw error;
  }
}

/**
 * Find wallet address from .env file in current directory
 */
async function findWalletAddress(): Promise<string | null> {
  try {
    const envPath = path.join(process.cwd(), ".env");

    if (!(await fs.pathExists(envPath))) {
      return null;
    }

    const envContent = await fs.readFile(envPath, "utf-8");

    // Look for WALLET_ADDRESS or SMART_ACCOUNT_ADDRESS
    const walletAddressMatch = envContent.match(/WALLET_ADDRESS=(.+)/);
    const smartAccountMatch = envContent.match(/SMART_ACCOUNT_ADDRESS=(.+)/);

    if (walletAddressMatch) {
      return walletAddressMatch[1].trim();
    }

    if (smartAccountMatch) {
      return smartAccountMatch[1].trim();
    }

    return null;
  } catch (error) {
    return null;
  }
}
