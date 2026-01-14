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
export async function topupWalletMainnet() {
    console.log(chalk.bold.cyan("\n┌─────────────────────────────────────┐"));
    console.log(chalk.bold.cyan("│   💰 Top Up Your Wallet 💰          │"));
    console.log(chalk.bold.cyan("└─────────────────────────────────────┘\n"));
    // Try to find wallet addresses from .env
    const wallets = await findWalletAddresses();
    let address;
    let blockchain = "base";
    let amount;
    if (wallets.length > 0) {
        // Found wallets in .env
        if (wallets.length === 1) {
            // Only one wallet found - confirm with user
            console.log(chalk.green(`✓ Found wallet: ${wallets[0].label}`));
            console.log(chalk.dim(`  Address: ${wallets[0].address}\n`));
            const { useFound } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "useFound",
                    message: "Use this address?",
                    default: true,
                },
            ]);
            if (useFound) {
                address = wallets[0].address;
                blockchain = wallets[0].type === "solana" ? "solana" : "base";
            }
            else {
                // User wants to use a different address
                const result = await promptForManualAddress();
                address = result.address;
                blockchain = result.blockchain;
            }
        }
        else {
            // Multiple wallets found - let user choose
            console.log(chalk.green(`✓ Found ${wallets.length} wallets in .env:\n`));
            const { selectedWallet } = await inquirer.prompt([
                {
                    type: "list",
                    name: "selectedWallet",
                    message: "Which wallet do you want to fund?",
                    choices: [
                        ...wallets.map((wallet, index) => ({
                            name: `${wallet.label}: ${wallet.address}`,
                            value: index.toString(),
                        })),
                        new inquirer.Separator(),
                        {
                            name: "Enter a different address",
                            value: "manual",
                        },
                    ],
                },
            ]);
            if (selectedWallet === "manual") {
                const result = await promptForManualAddress();
                address = result.address;
                blockchain = result.blockchain;
            }
            else {
                const wallet = wallets[parseInt(selectedWallet)];
                address = wallet.address;
                blockchain = wallet.type === "solana" ? "solana" : "base";
            }
        }
    }
    else {
        // No .env found - prompt for address
        console.log(chalk.yellow("No .env file found in current directory.\n"));
        const result = await promptForManualAddress();
        address = result.address;
        blockchain = result.blockchain;
    }
    // Ask for amount
    const { presetAmount } = await inquirer.prompt([
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
        const { customAmount } = await inquirer.prompt([
            {
                type: "input",
                name: "customAmount",
                message: "Enter amount in USD:",
                validate: (input) => {
                    const num = parseFloat(input);
                    if (isNaN(num) || num <= 0) {
                        return "Please enter a valid amount";
                    }
                    return true;
                },
            },
        ]);
        amount = customAmount;
    }
    else {
        amount = presetAmount;
    }
    // Generate onramp URL
    const spinner = ora({
        text: "Generating funding link...",
        color: "cyan",
    }).start();
    try {
        spinner.succeed(chalk.green("Funding link ready!\n"));
        await displayOnrampInstructions(address, amount, blockchain);
    }
    catch (error) {
        spinner.fail(chalk.red("Failed to generate funding link"));
        throw error;
    }
}
/**
 * Prompt user to manually enter an address
 */
async function promptForManualAddress() {
    // First ask which blockchain
    const { blockchain } = await inquirer.prompt([
        {
            type: "list",
            name: "blockchain",
            message: "Which blockchain?",
            choices: [
                { name: "Base (EVM)", value: "base" },
                { name: "Solana", value: "solana" },
            ],
        },
    ]);
    // Then ask for address with appropriate validation
    const { manualAddress } = await inquirer.prompt([
        {
            type: "input",
            name: "manualAddress",
            message: `Enter ${blockchain === "solana" ? "Solana" : "EVM"} wallet address:`,
            validate: (input) => {
                if (blockchain === "solana") {
                    if (!input.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
                        return "Please enter a valid Solana address";
                    }
                }
                else {
                    if (!input.match(/^0x[a-fA-F0-9]{40}$/)) {
                        return "Please enter a valid Ethereum address (0x...)";
                    }
                }
                return true;
            },
        },
    ]);
    return { address: manualAddress, blockchain };
}
/**
 * Request testnet USDC from the faucet for an existing wallet
 */
export async function topupWalletTestnet() {
    console.log(chalk.bold.magenta("\n┌─────────────────────────────────────┐"));
    console.log(chalk.bold.magenta("│   🚰 Testnet Faucet 🚰              │"));
    console.log(chalk.bold.magenta("└─────────────────────────────────────┘\n"));
    // Try to find wallet addresses from .env
    const wallets = await findWalletAddresses();
    let address;
    let blockchain = "evm";
    if (wallets.length > 0) {
        // Found wallets in .env
        if (wallets.length === 1) {
            // Only one wallet found - confirm with user
            console.log(chalk.green(`✓ Found wallet: ${wallets[0].label}`));
            console.log(chalk.dim(`  Address: ${wallets[0].address}\n`));
            const { useFound } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "useFound",
                    message: "Use this address?",
                    default: true,
                },
            ]);
            if (useFound) {
                address = wallets[0].address;
                blockchain = wallets[0].type === "solana" ? "solana" : "evm";
            }
            else {
                // User wants to use a different address
                const result = await promptForManualAddress();
                address = result.address;
                blockchain = result.blockchain === "solana" ? "solana" : "evm";
            }
        }
        else {
            // Multiple wallets found - let user choose
            console.log(chalk.green(`✓ Found ${wallets.length} wallets in .env:\n`));
            const { selectedWallet } = await inquirer.prompt([
                {
                    type: "list",
                    name: "selectedWallet",
                    message: "Which wallet do you want to fund?",
                    choices: [
                        ...wallets.map((wallet, index) => ({
                            name: `${wallet.label}: ${wallet.address}`,
                            value: index.toString(),
                        })),
                        new inquirer.Separator(),
                        {
                            name: "Enter a different address",
                            value: "manual",
                        },
                    ],
                },
            ]);
            if (selectedWallet === "manual") {
                const result = await promptForManualAddress();
                address = result.address;
                blockchain = result.blockchain === "solana" ? "solana" : "evm";
            }
            else {
                const wallet = wallets[parseInt(selectedWallet)];
                address = wallet.address;
                blockchain = wallet.type === "solana" ? "solana" : "evm";
            }
        }
    }
    else {
        // No .env found - prompt for address
        console.log(chalk.yellow("No .env file found in current directory.\n"));
        const result = await promptForManualAddress();
        address = result.address;
        blockchain = result.blockchain === "solana" ? "solana" : "evm";
    }
    // Request testnet funds
    const networkName = blockchain === "solana" ? "Solana Devnet" : "Base Sepolia";
    const spinner = ora({
        text: `Requesting testnet USDC from faucet (${networkName})...`,
        color: "magenta",
    }).start();
    try {
        const response = await requestTestnetFaucet({ address, blockchain });
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
        // Display usage limits based on blockchain
        console.log(chalk.dim("💡 Note: USDC faucet allows 10 claims per 24 hours"));
        if (blockchain === "solana") {
            console.log(chalk.dim("   Each claim provides 1 testnet USDC on Solana Devnet\n"));
        }
        else {
            console.log(chalk.dim("   Each claim provides 1 testnet USDC on Base Sepolia\n"));
        }
    }
    catch (error) {
        spinner.fail(chalk.red("Failed to request testnet funds"));
        // Show more helpful error messages
        if (error instanceof Error) {
            if (error.message.includes("rate limit")) {
                console.error(chalk.yellow("\n⚠ Rate limit exceeded!"));
                console.error(chalk.dim("The faucet allows 10 claims per 24 hours."));
                console.error(chalk.dim("Please try again later.\n"));
            }
            else {
                console.error(chalk.red(`\nError: ${error.message}\n`));
            }
        }
        throw error;
    }
}
/**
 * Find all wallet addresses from .env file in current directory
 */
async function findWalletAddresses() {
    try {
        const envPath = path.join(process.cwd(), ".env");
        if (!(await fs.pathExists(envPath))) {
            return [];
        }
        const envContent = await fs.readFile(envPath, "utf-8");
        const wallets = [];
        // Look for WALLET_ADDRESS (EOA)
        const walletAddressMatch = envContent.match(/WALLET_ADDRESS=(.+)/);
        if (walletAddressMatch) {
            wallets.push({
                address: walletAddressMatch[1].trim(),
                type: "evm",
                label: "EVM Wallet (EOA)",
            });
        }
        // Look for SMART_ACCOUNT_ADDRESS
        const smartAccountMatch = envContent.match(/SMART_ACCOUNT_ADDRESS=(.+)/);
        if (smartAccountMatch) {
            wallets.push({
                address: smartAccountMatch[1].trim(),
                type: "evm",
                label: "EVM Smart Account",
            });
        }
        // Look for SOLANA_ADDRESS
        const solanaAddressMatch = envContent.match(/SOLANA_ADDRESS=(.+)/);
        if (solanaAddressMatch) {
            wallets.push({
                address: solanaAddressMatch[1].trim(),
                type: "solana",
                label: "Solana Wallet",
            });
        }
        return wallets;
    }
    catch (error) {
        return [];
    }
}
/**
 * Find wallet address from .env file in current directory (legacy function)
 */
async function findWalletAddress() {
    const wallets = await findWalletAddresses();
    return wallets.length > 0 ? wallets[0].address : null;
}
//# sourceMappingURL=topup.js.map