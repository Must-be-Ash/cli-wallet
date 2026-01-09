#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createWallet } from "./commands/create-wallet.js";
import { topupWallet } from "./commands/topup.js";
const program = new Command();
// Package information
program
    .name("add-wallet")
    .description("Create a crypto wallet instantly using Coinbase Developer Platform")
    .version("1.0.1");
// Main command (default action)
program
    .description("Create a new crypto wallet on Base Mainnet\n\n" +
    chalk.dim("This tool creates a wallet using CDP Server Wallets v2 API.\n") +
    chalk.dim("Your private key will be saved to a .env file in your current directory."))
    .action(async () => {
    try {
        await createWallet();
    }
    catch (error) {
        console.error(chalk.red("\n✖ An error occurred:"));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
});
// Top-up command - generate new funding link
program
    .command("topup")
    .description("Generate a new funding link for your wallet")
    .action(async () => {
    try {
        await topupWallet();
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