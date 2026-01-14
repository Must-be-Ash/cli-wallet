#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createWallet } from "./commands/create-wallet.js";
import { topupWalletMainnet, topupWalletTestnet } from "./commands/topup.js";
const program = new Command();
// Package information
program
    .name("add-wallet")
    .description("Create a crypto wallet instantly using Coinbase Developer Platform")
    .version("1.0.1");
// Main command (default action) - creates EVM wallet
program
    .description("Create a new crypto wallet on Base Mainnet\n\n" +
    chalk.dim("This tool creates a wallet using CDP Server Wallets v2 API.\n") +
    chalk.dim("Your private key will be saved to a .env file in your current directory.\n\n") +
    chalk.dim("Usage:\n") +
    chalk.dim("  npx add-wallet       - Create an EVM wallet\n") +
    chalk.dim("  npx add-wallet sol   - Create a Solana wallet"))
    .argument("[blockchain]", "Blockchain to create wallet on (evm or sol)")
    .action(async (blockchain) => {
    try {
        if (!blockchain) {
            // Default: create EVM wallet
            await createWallet("evm");
        }
        else if (blockchain === "sol" || blockchain === "solana") {
            // Create Solana wallet
            await createWallet("sol");
        }
        else if (blockchain === "evm" || blockchain === "ethereum") {
            // Explicit EVM wallet
            await createWallet("evm");
        }
        else {
            console.error(chalk.red(`\n✖ Unknown blockchain: ${blockchain}`));
            console.error(chalk.yellow("Valid options: 'sol' or 'evm' (or leave empty for EVM)\n"));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk.red("\n✖ An error occurred:"));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
});
// Top-up command - supports both mainnet and testnet
program
    .command("topup [network]")
    .description("Fund your wallet\n" +
    "  - topup          : Generate funding link for mainnet USDC\n" +
    "  - topup testnet  : Get testnet USDC on Base Sepolia")
    .action(async (network) => {
    try {
        if (network === "testnet") {
            await topupWalletTestnet();
        }
        else if (!network) {
            await topupWalletMainnet();
        }
        else {
            console.error(chalk.red(`\n✖ Unknown network: ${network}`));
            console.error(chalk.yellow("Valid options: 'topup' or 'topup testnet'\n"));
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk.red("\n✖ An error occurred:"));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
});
// Help command
program
    .command("help")
    .description("Show help information")
    .action(() => {
    program.help();
});
// Parse command line arguments
program.parse(process.argv);
//# sourceMappingURL=index.js.map