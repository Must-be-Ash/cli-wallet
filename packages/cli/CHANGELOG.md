# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-09

### Added
- Initial release of @add-wallet CLI
- Interactive wallet creation with Commander.js and Inquirer.js
- Support for EOA (Externally Owned Account) creation
- Support for Smart Account creation (EIP-4337)
- Automatic `.env` file generation with wallet credentials
- Automatic `.gitignore` update to protect private keys
- Coinbase Pay onramp integration with session tokens
- One-click-buy experience with $5 preset amount
- Pre-configured for USDC on Base network
- Comprehensive security warnings and user prompts
- Colored terminal output with Chalk
- Loading spinners with Ora
- Error handling with user-friendly messages
- Backend API integration via Axios
- File operations with fs-extra

### Features
- **Wallet Types**: Choose between EOA and Smart Account
- **Security**: Private keys saved with 0o600 permissions
- **Onramp**: Session-based Coinbase Pay URLs
- **Network**: Base Mainnet (Chain ID: 8453)
- **Asset**: USDC (US Dollar stablecoin)
- **UX**: Interactive CLI with progress indicators

### Security
- Private keys never transmitted over network
- Session tokens expire after 5 minutes
- Automatic `.gitignore` updates
- Prominent security warnings
- Read/write-only file permissions

### Technical
- Node.js 18+ required
- ES modules (type: "module")
- TypeScript source with JavaScript distribution
- Backend API on Vercel
- CDP SDK integration

## [Unreleased]

### Planned Features
- Automated unit tests
- Additional network support (Sepolia testnet)
- Balance checking
- Transaction sending
- Multi-language support
- Verbose/quiet modes
- Custom preset amounts

---

For more details, see the [GitHub repository](https://github.com/Must-be-Ash/cli-wallet).
