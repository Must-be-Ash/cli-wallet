import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import {
  createEOAWallet,
  createSmartAccountWallet,
  EOAWalletResponse,
  SmartAccountResponse,
} from "../utils/api-client.js";
import { saveToEnvFile, ensureGitignore } from "../utils/env-manager.js";
import {
  displaySecurityWarnings,
  displayFinalSecurityReminders,
} from "../utils/security-warnings.js";
import { displayOnrampInstructions } from "../utils/onramp.js";

/**
 * Account type options for wallet creation
 */
type AccountType = "eoa" | "smart-account";

/**
 * Main function to create a wallet
 */
export async function createWallet(): Promise<void> {
  console.log(chalk.cyan.bold("\n┌─────────────────────────────────────┐"));
  console.log(chalk.cyan.bold("│   🚀 Create Your Crypto Wallet 🚀   │"));
  console.log(chalk.cyan.bold("└─────────────────────────────────────┘\n"));

  // Step 1: Display security warnings and get acknowledgment
  await displaySecurityWarnings();

  // Step 2: Select account type
  const accountType = await selectAccountType();

  console.log(
    chalk.green(
      `\n✓ Selected: ${accountType === "eoa" ? "EOA" : "Smart Account"}\n`
    )
  );

  // Step 3: Create wallet with loading spinner
  const spinner = ora({
    text: "Creating your wallet...",
    color: "cyan",
  }).start();

  let wallet: EOAWalletResponse | SmartAccountResponse;

  try {
    if (accountType === "eoa") {
      wallet = await createEOAWallet();
      spinner.succeed(chalk.green("Wallet created successfully!"));
      displayEOAWallet(wallet);
    } else {
      wallet = await createSmartAccountWallet();
      spinner.succeed(chalk.green("Smart Account created successfully!"));
      displaySmartAccountWallet(wallet);
    }
  } catch (error) {
    spinner.fail(chalk.red("Failed to create wallet"));
    throw error; // Re-throw to be handled by main error handler
  }

  // Step 4: Save to .env file
  spinner.start("Saving credentials to .env file...");

  try {
    const envPath = await saveToEnvFile(wallet);
    spinner.succeed(chalk.green("Credentials saved to .env"));

    // Ensure .gitignore includes .env
    await ensureGitignore();

    // Step 5: Display final security reminders
    displayFinalSecurityReminders(envPath);

    // Step 6: Display onramp instructions
    const walletAddress =
      wallet.accountType === "eoa"
        ? wallet.address
        : wallet.smartAccountAddress;

    spinner.start("Generating funding link...");
    try {
      await displayOnrampInstructions(walletAddress, "5");
      spinner.succeed(chalk.green("Funding link ready"));
    } catch (error) {
      spinner.warn(chalk.yellow("Could not generate funding link"));
      console.log(
        chalk.dim(
          "You can manually fund your wallet via Coinbase at https://pay.coinbase.com\n"
        )
      );
    }

    // Step 7: Success message
    console.log(chalk.green.bold("✅ Wallet setup complete!\n"));
    console.log(chalk.cyan("Next steps:"));
    console.log(chalk.dim("1. Fund your wallet using the Coinbase Pay link above"));
    console.log(chalk.dim("2. Use your wallet for x402 payments"));
    console.log(chalk.dim("3. Keep your private key secure\n"));
  } catch (error) {
    spinner.fail(chalk.red("Failed to save credentials"));
    throw error;
  }
}

/**
 * Prompt user to select account type
 */
async function selectAccountType(): Promise<AccountType> {
  console.log(chalk.bold("Choose your wallet type:\n"));

  // Display detailed explanations for each option
  console.log(chalk.cyan("1. EOA (Externally Owned Account)"));
  console.log(chalk.dim("   • Simple wallet controlled by a private key"));
  console.log(chalk.dim("   • Works on all EVM-compatible networks"));
  console.log(chalk.dim("   • Standard wallet type, like MetaMask"));
  console.log(chalk.dim("   • Best for most users\n"));

  console.log(chalk.magenta("2. Smart Account"));
  console.log(chalk.dim("   • Advanced features: gas sponsorship, batch transactions"));
  console.log(chalk.dim("   • Only works on Base Mainnet and Base Sepolia"));
  console.log(chalk.dim("   • Uses EIP-4337 account abstraction"));
  console.log(chalk.dim("   • Requires owner EOA to sign transactions"));
  console.log(chalk.dim("   • Best for advanced users or apps\n"));

  const answer = await inquirer.prompt<{ accountType: AccountType }>([
    {
      type: "list",
      name: "accountType",
      message: "Select wallet type:",
      choices: [
        {
          name: chalk.cyan("EOA - Simple wallet (Recommended for most users)"),
          value: "eoa" as AccountType,
          short: "EOA",
        },
        {
          name: chalk.magenta("Smart Account - Advanced features"),
          value: "smart-account" as AccountType,
          short: "Smart Account",
        },
      ],
      default: "eoa",
    },
  ]);

  return answer.accountType;
}

/**
 * Display EOA wallet details
 */
function displayEOAWallet(wallet: EOAWalletResponse): void {
  console.log(chalk.bold("\n📋 Your Wallet Details:\n"));
  console.log(chalk.cyan("Wallet Address:"));
  console.log(chalk.white(wallet.address));
  console.log(chalk.dim(`\nNetwork: ${wallet.network}`));
  console.log(
    chalk.dim(
      "\n💡 Your private key will be saved to .env in the next step.\n"
    )
  );
}

/**
 * Display Smart Account wallet details
 */
function displaySmartAccountWallet(wallet: SmartAccountResponse): void {
  console.log(chalk.bold("\n📋 Your Smart Account Details:\n"));
  console.log(chalk.magenta("Smart Account Address:"));
  console.log(chalk.white(wallet.smartAccountAddress));
  console.log(chalk.cyan("\nOwner EOA Address:"));
  console.log(chalk.white(wallet.ownerAddress));
  console.log(chalk.dim(`\nNetwork: ${wallet.network}`));

  if (wallet.note) {
    console.log(chalk.yellow(`\n⚠️  ${wallet.note}`));
  }

  console.log(
    chalk.dim(
      "\n💡 Your owner's private key will be saved to .env in the next step.\n"
    )
  );
}

