import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import {
  createEOAWallet,
  createSmartAccountWallet,
  createSolanaWallet,
  EOAWalletResponse,
  SmartAccountResponse,
  SolanaWalletResponse,
} from "../utils/api-client.js";
import { saveToEnvFile, ensureGitignore } from "../utils/env-manager.js";
import { displaySecurityWarnings } from "../utils/security-warnings.js";
import { displayOnrampInstructions } from "../utils/onramp.js";

/**
 * Account type options for wallet creation
 */
type AccountType = "eoa" | "smart-account";

/**
 * Blockchain type
 */
type BlockchainType = "evm" | "sol";

/**
 * Main function to create a wallet
 */
export async function createWallet(blockchain: BlockchainType = "evm"): Promise<void> {
  console.log(chalk.cyan.bold("\n┌─────────────────────────────────────┐"));
  console.log(chalk.cyan.bold("│   🚀 Create Your Crypto Wallet 🚀   │"));
  console.log(chalk.cyan.bold("└─────────────────────────────────────┘\n"));

  let wallet: EOAWalletResponse | SmartAccountResponse | SolanaWalletResponse;
  const spinner = ora({ color: "cyan" });

  // Handle Solana wallet creation
  if (blockchain === "sol") {
    console.log(chalk.cyan("Creating Solana wallet...\n"));

    // Display security reminders
    displaySecurityWarnings();

    // Create Solana wallet with loading spinner
    spinner.text = "Creating your Solana wallet...";
    spinner.start();

    try {
      wallet = await createSolanaWallet();
      spinner.succeed(chalk.green("Solana wallet created successfully!"));
    } catch (error) {
      spinner.fail(chalk.red("Failed to create Solana wallet"));
      throw error;
    }
  } else {
    // Handle EVM wallet creation (existing logic)
    // Step 1: Select account type
    const accountType = await selectAccountType();

    console.log(
      chalk.green(
        `\n✓ Selected: ${accountType === "eoa" ? "EOA" : "Smart Account"}\n`
      )
    );

    // Step 2: Display security reminders
    displaySecurityWarnings();

    // Step 3: Create wallet with loading spinner
    spinner.text = "Creating your wallet...";
    spinner.start();

    try {
      if (accountType === "eoa") {
        wallet = await createEOAWallet();
        spinner.succeed(chalk.green("Wallet created successfully!"));
      } else {
        wallet = await createSmartAccountWallet();
        spinner.succeed(chalk.green("Smart Account created successfully!"));
      }
    } catch (error) {
      spinner.fail(chalk.red("Failed to create wallet"));
      throw error; // Re-throw to be handled by main error handler
    }
  }

  // Step 4: Save to .env file
  spinner.text = "Saving credentials...";
  spinner.start();

  try {
    const envPath = await saveToEnvFile(wallet);
    await ensureGitignore();

    const displayPath = envPath.replace(process.cwd(), ".");
    spinner.succeed(chalk.green("Credentials saved to ") + chalk.white(displayPath));

    // Step 5: Display onramp instructions (only for EVM wallets)
    if (wallet.accountType !== "solana") {
      const walletAddress =
        wallet.accountType === "eoa"
          ? wallet.address
          : wallet.smartAccountAddress;

      spinner.text = "Generating funding link...";
      spinner.start();
      try {
        await displayOnrampInstructions(walletAddress, "5");
        spinner.stop();
      } catch (error) {
        spinner.warn(chalk.yellow("Could not generate funding link"));
        console.log(
          chalk.dim(
            "You can manually fund your wallet at https://pay.coinbase.com\n"
          )
        );
      }
    } else {
      // For Solana wallets, display onramp instructions with Solana support
      spinner.text = "Generating funding link...";
      spinner.start();
      try {
        await displayOnrampInstructions(wallet.address, "5", "solana");
        spinner.stop();
      } catch (error) {
        spinner.warn(chalk.yellow("Could not generate funding link"));
        console.log(chalk.cyan("\n💰 Fund your Solana wallet:"));
        console.log(chalk.dim("  • Use a Solana faucet for devnet: https://faucet.solana.com"));
        console.log(chalk.dim("  • Transfer SOL from an exchange for mainnet"));
        console.log(chalk.dim(`  • Your address: ${wallet.address}\n`));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red("Failed to save credentials"));
    throw error;
  }
}

/**
 * Prompt user to select account type
 */
async function selectAccountType(): Promise<AccountType> {
  const answer = await inquirer.prompt<{ accountType: AccountType }>([
    {
      type: "list",
      name: "accountType",
      message: "Choose your wallet type:",
      choices: [
        {
          name:
            chalk.cyan("EOA (Externally Owned Account)") +
            chalk.dim("\n   • Simple wallet controlled by a private key") +
            chalk.dim("\n   • Works on all EVM-compatible networks") +
            chalk.dim("\n   • Standard wallet type, like MetaMask") +
            chalk.dim("\n   • Best for most users") +
            chalk.dim("\n   • Gas is covered by default for x402 (you don't need a smart account to have gas sponsored with x402)"),
          value: "eoa" as AccountType,
          short: "EOA",
        },
        new inquirer.Separator(),
        {
          name:
            chalk.magenta("Smart Account") +
            chalk.dim("\n   • Advanced features: batch transactions, sponsored transactions") +
            chalk.dim("\n   • Uses EIP-4337 account abstraction") +
            chalk.dim("\n   • Requires owner EOA to sign transactions") +
            chalk.dim("\n   • Best for advanced users or apps"),
          value: "smart-account" as AccountType,
          short: "Smart Account",
        },
      ],
      default: "eoa",
      pageSize: 15,
    },
  ]);

  return answer.accountType;
}

