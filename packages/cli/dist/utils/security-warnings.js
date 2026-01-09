import chalk from "chalk";
/**
 * Display security reminders (no user acknowledgment required)
 */
export function displaySecurityWarnings() {
    console.log(chalk.cyan.bold("Security Reminder\n"));
    console.log(chalk.hex("#FFA500")("1. KEEP YOUR PRIVATE KEY SECURE"));
    console.log(chalk.dim("   • Your private key gives FULL CONTROL over your wallet"));
    console.log(chalk.dim("   • Anyone with your private key can steal your funds"));
    console.log(chalk.dim("   • NEVER share your private key with anyone\n"));
    console.log(chalk.hex("#FFA500")("2. BACKUP YOUR PRIVATE KEY"));
    console.log(chalk.dim("   • Store your private key in a secure location"));
    console.log(chalk.dim("   • Consider using a password manager or hardware wallet"));
    console.log(chalk.dim("   • If you lose it, you CANNOT recover your wallet\n"));
    console.log(chalk.hex("#FFA500")("3. DO NOT COMMIT .ENV TO VERSION CONTROL"));
    console.log(chalk.dim("   • Your .env file contains sensitive private key information"));
    console.log(chalk.dim("   • Ensure .env is in your .gitignore file"));
    console.log(chalk.dim("   • NEVER push .env to GitHub, GitLab, or any public repo\n"));
    console.log(chalk.hex("#FFA500")("4. BE AWARE OF PHISHING"));
    console.log(chalk.dim("   • No legitimate service will EVER ask for your private key"));
    console.log(chalk.dim("   • Always verify URLs before entering sensitive information"));
    console.log(chalk.dim("   • Be cautious of unsolicited messages or emails\n"));
}
/**
 * Display final security reminders after wallet creation
 */
export function displayFinalSecurityReminders(envPath) {
    console.log(chalk.yellow.bold("\n🔒 Security Reminders:\n"));
    console.log(chalk.yellow("• Your private key is saved in:"));
    console.log(chalk.white(`  ${envPath}\n`));
    console.log(chalk.yellow("• Make sure this file is in your .gitignore"));
    console.log(chalk.yellow("• Backup your private key to a secure location"));
    console.log(chalk.yellow("• NEVER share your private key with anyone"));
    console.log(chalk.yellow("• Consider moving funds to a hardware wallet for long-term storage\n"));
}
//# sourceMappingURL=security-warnings.js.map