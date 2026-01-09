# add-wallet

> Instantly create a crypto wallet on Base with USDC onramp - powered by Coinbase Developer Platform

A simple CLI tool that creates an Ethereum wallet on Base network with a ready-to-use Coinbase Pay onramp link, perfect for x402 payments and web3 applications.

## Features

- 🚀 **One Command Setup** - Create a wallet and get funding link in seconds
- 🔐 **Full Control** - Your wallet, your keys - exported to `.env` file
- 💳 **Easy Funding** - Get a pre-configured Coinbase Pay link with $5 preset
- 🌐 **Base Network** - Low gas fees on Ethereum's Layer 2
- 💵 **USDC Ready** - Pre-configured for USDC (US Dollar stablecoin)
- ⚡ **Two Wallet Types** - Choose EOA (simple) or Smart Account (advanced)

## Quick Start

```bash
npx add-wallet
```

That's it! Follow the interactive prompts to:
1. Choose wallet type (EOA recommended)
2. Create your wallet
3. Get your private key saved to `.env`
4. Receive a Coinbase Pay funding link

## Requirements

- Node.js 18 or higher
- Internet connection
- (For funding) US resident with debit card or Coinbase account

## What You Get

After running the CLI, you'll have:

### 1. A New Wallet
```
Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
Network: base-mainnet
```

### 2. Private Key in `.env`
```env
# Wallet created on 2026-01-09T...
WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
WALLET_PRIVATE_KEY=0x...
```

### 3. Funding Link
```
https://pay.coinbase.com/buy?sessionToken=...&defaultAsset=USDC&presetFiatAmount=5
```

## Wallet Types

### EOA (Externally Owned Account) - Recommended
- Simple wallet controlled by a private key
- Works on all EVM-compatible networks
- Standard wallet type (like MetaMask)
- **Best for most users**

### Smart Account
- Advanced features: gas sponsorship, batch transactions
- Only works on Base Mainnet and Base Sepolia
- Uses EIP-4337 account abstraction
- Requires owner EOA to sign transactions
- **Best for advanced users or apps**

## Usage Examples

### Basic Usage
```bash
npx add-wallet
```

### Using in Your Application
After creating a wallet, use it in your Node.js app:

```javascript
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Load wallet from .env
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

console.log('Wallet Address:', wallet.address);

// Check balance
const balance = await provider.getBalance(wallet.address);
console.log('Balance:', ethers.formatEther(balance), 'ETH');
```

### Funding Your Wallet

The CLI provides a Coinbase Pay link that:
- Pre-fills USDC on Base network
- Sets amount to $5 (customizable)
- Works with debit cards (US only) or Coinbase accounts
- Delivers funds in minutes

**Guest Checkout (US Only):**
- No Coinbase account needed
- Up to $500/week
- Apple Pay or debit card

**Coinbase Account (Global):**
- Works in 100+ countries
- Higher limits
- Multiple payment methods

## Security Best Practices

⚠️ **CRITICAL**: Your private key gives full control of your wallet

**DO:**
- ✅ Keep your `.env` file secure
- ✅ Add `.env` to `.gitignore` (CLI does this automatically)
- ✅ Backup your private key securely
- ✅ Use a password manager or hardware wallet for storage

**DON'T:**
- ❌ Share your private key with anyone
- ❌ Commit `.env` to git repositories
- ❌ Store private keys in plain text files
- ❌ Use the same wallet for large amounts without proper security

## Configuration

### Environment Variables

The CLI creates these in your `.env` file:

**For EOA:**
```env
WALLET_ADDRESS=0x...
WALLET_PRIVATE_KEY=0x...
```

**For Smart Account:**
```env
SMART_ACCOUNT_ADDRESS=0x...
OWNER_ADDRESS=0x...
OWNER_PRIVATE_KEY=0x...
```

### API Backend

By default, the CLI connects to the production API at `https://cli-wallet.vercel.app/`

To use a custom API endpoint:
```bash
API_URL=http://localhost:3000 npx add-wallet
```

## Troubleshooting

### "Failed to write to .env file"
- Check you have write permissions in the current directory
- Ensure the directory exists

### "Unable to connect to the wallet API"
- Check your internet connection
- Verify the API is accessible
- Try again in a few moments

### "Missing required scope: accounts#export"
- This is a backend API configuration issue
- The API keys need proper scopes in CDP Portal

### Onramp Link Not Working
- Session tokens expire after 5 minutes - run CLI again
- Each token is single-use only
- Guest checkout is US-only (others need Coinbase account)

## Network Information

**Base Mainnet:**
- Chain ID: 8453
- RPC URL: `https://mainnet.base.org`
- Block Explorer: https://basescan.org
- Native Token: ETH
- Stablecoin: USDC (recommended for payments)

## Use Cases

- **x402 Payments** - Accept crypto payments in your apps
- **Web3 Development** - Quick wallet setup for testing
- **DApp Integration** - Onboard users with instant wallets
- **Payment Processing** - Accept USDC on Base network
- **NFT Projects** - Provide users with funded wallets
- **Hackathons** - Fast wallet creation for participants

## How It Works

1. **Backend API** (Next.js on Vercel)
   - Authenticates with Coinbase Developer Platform
   - Creates wallets using CDP Server Wallets API
   - Exports private keys securely
   - Generates session tokens for onramp

2. **CLI Tool** (Node.js)
   - Interactive prompts for wallet type
   - Calls backend API to create wallet
   - Saves credentials to `.env` file
   - Displays funding link

3. **Coinbase Pay**
   - Session-based authentication
   - Pre-filled for USDC on Base
   - One-click-buy experience
   - Secure and compliant

## API Endpoints

The backend provides:

- `GET /api/health` - Health check
- `POST /api/wallet/eoa` - Create EOA wallet
- `POST /api/wallet/smart-account` - Create Smart Account
- `POST /api/onramp/session` - Generate funding link

## Development

### Running Locally

1. Clone the repository
```bash
git clone https://github.com/Must-be-Ash/cli-wallet.git
cd cli-wallet/packages/cli
```

2. Install dependencies
```bash
npm install
```

3. Build
```bash
npm run build
```

4. Run locally
```bash
node dist/index.js
```

### Building from Source

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## Tech Stack

- **CLI Framework**: Commander.js
- **Interactive Prompts**: Inquirer.js
- **Styling**: Chalk
- **Loading States**: Ora
- **HTTP Client**: Axios
- **File Operations**: fs-extra
- **Backend**: Next.js, Vercel
- **Wallet API**: Coinbase Developer Platform

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## Support

- **Issues**: [GitHub Issues](https://github.com/Must-be-Ash/cli-wallet/issues)
- **Documentation**: [Technical Spec](https://github.com/Must-be-Ash/cli-wallet/blob/main/TECHNICAL_SPEC.md)
- **CDP Discord**: [Join #onramp channel](https://discord.com/invite/cdp)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Disclaimer

This tool creates real wallets on Base mainnet. Always follow security best practices when handling private keys. The authors are not responsible for any loss of funds due to improper handling of private keys.

---

Built with ❤️ using [Coinbase Developer Platform](https://coinbase.com/developer-platform)
