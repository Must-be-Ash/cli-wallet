import fs from "fs-extra";
import path from "path";
/**
 * Save wallet credentials to .env file in the current directory
 */
export async function saveToEnvFile(wallet) {
    const envPath = path.join(process.cwd(), ".env");
    const timestamp = new Date().toISOString();
    // Check if .env file exists
    const envExists = await fs.pathExists(envPath);
    let envContent = "";
    if (envExists) {
        // Read existing .env file
        envContent = await fs.readFile(envPath, "utf-8");
        // Add a newline if file doesn't end with one
        if (envContent.length > 0 && !envContent.endsWith("\n")) {
            envContent += "\n";
        }
        // Add separator
        envContent += "\n";
    }
    // Add timestamp comment
    envContent += `# Wallet created on ${timestamp}\n`;
    // Add wallet credentials based on type
    if (wallet.accountType === "eoa") {
        envContent += `WALLET_ADDRESS=${wallet.address}\n`;
        envContent += `WALLET_PRIVATE_KEY=${wallet.privateKey}\n`;
    }
    else {
        envContent += `SMART_ACCOUNT_ADDRESS=${wallet.smartAccountAddress}\n`;
        envContent += `OWNER_ADDRESS=${wallet.ownerAddress}\n`;
        envContent += `OWNER_PRIVATE_KEY=${wallet.ownerPrivateKey}\n`;
    }
    // Add note about topup command
    envContent += `\n# Run 'npx add-wallet topup' at any time to topup your wallet\n`;
    // Add note about testnet command
    envContent += `# Run 'npx add-wallet topup testnet' at any time to topup your wallet with testnet USDC on Base Sepolia\n`;
    // Write to .env file
    try {
        await fs.writeFile(envPath, envContent, { mode: 0o600 }); // Read/write for owner only
        return envPath;
    }
    catch (error) {
        throw new Error(`Failed to write to .env file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Ensure .gitignore includes .env
 */
export async function ensureGitignore() {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    try {
        let gitignoreContent = "";
        // Check if .gitignore exists
        if (await fs.pathExists(gitignorePath)) {
            gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
            // Check if .env is already in .gitignore
            if (gitignoreContent.includes(".env")) {
                return; // Already present
            }
            // Add newline if needed
            if (gitignoreContent.length > 0 && !gitignoreContent.endsWith("\n")) {
                gitignoreContent += "\n";
            }
        }
        // Add .env to .gitignore
        gitignoreContent += "\n# Environment variables (added by @add-wallet)\n";
        gitignoreContent += ".env\n";
        await fs.writeFile(gitignorePath, gitignoreContent);
    }
    catch (error) {
        // Non-critical error, just log it
        console.warn("Warning: Could not update .gitignore:", error instanceof Error ? error.message : String(error));
    }
}
//# sourceMappingURL=env-manager.js.map