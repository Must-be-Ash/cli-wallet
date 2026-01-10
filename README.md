# CLI Wallet - Add Wallet Tool

A CLI tool that creates crypto wallets using Coinbase Developer Platform's Server Wallets v2 API. This tool allows developers to instantly create and fund wallets on Base Mainnet for x402 payments.

## Overview

This project consists of:
- **Next.js API Backend**: Serverless functions deployed on Vercel that interact with CDP Server Wallets v2
- **CLI Package** ([add-wallet](https://www.npmjs.com/package/add-wallet)): NPX-executable tool for wallet creation

Users can run `npx add-wallet` to create a wallet, export private keys to `.env`, and get a link to fund with USDC via Coinbase Pay.

**Topup Feature**: If your funding link expires or you need to fund your wallet again, use `npx add-wallet topup` to generate a new funding link for any wallet address.

## Prerequisites

- Node.js 18+
- Coinbase Developer Platform account
- CDP API credentials

## Getting CDP API Credentials

To use this tool, you need CDP (Coinbase Developer Platform) API credentials:

1. **Create a CDP Account**: Visit [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
2. **Sign in or Create Account**: Use your Coinbase account or create a new one
3. **Create API Keys**:
   - Navigate to [API Keys](https://portal.cdp.coinbase.com/projects/api-keys)
   - Click "Create API Key"
   - Save your `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET`
4. **Generate Wallet Secret**:
   - Go to [Wallet API](https://portal.cdp.coinbase.com/products/wallet-api)
   - Click "Generate Wallet Secret"
   - Save your `CDP_WALLET_SECRET`

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```
CDP_PROJECT_ID=your-project-id
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

⚠️ **Never commit your `.env` file to version control!**

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify the API is running.

## Project Structure

```
cli-wallet/
├── app/                    # Next.js App Router
│   └── api/               # API routes
│       ├── wallet/        # Wallet creation endpoints
│       └── health/        # Health check endpoint
├── lib/                   # Utility functions
│   └── cdp-client.ts     # CDP SDK client
├── packages/
│   └── cli/              # CLI package (@add-wallet)
├── .env                  # Environment variables (not committed)
├── .env.example          # Example environment variables
└── TECHNICAL_SPEC.md     # Implementation specification
```

## API Endpoints

- `POST /api/wallet/eoa` - Create EOA (Externally Owned Account)
- `POST /api/wallet/smart-account` - Create Smart Account
- `POST /api/onramp/session` - Generate funding link for wallet topup
- `GET /api/health` - Health check

## Development

Build the project:

```bash
npm run build
```

Run linter:

```bash
npm run lint
```

### Testing CLI Locally

To test the CLI package locally before publishing:

```bash
# Build the CLI package first
cd packages/cli
npm run build

# Then run it from the project root
node packages/cli/dist/index.js
```

Or use the topup command:

```bash
node packages/cli/dist/index.js topup
```

## Deployment

This project is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Set up Redis for rate limiting:
   - Go to Storage tab in Vercel dashboard
   - Click "Create Database" → Select Redis
   - Connect to your project (auto-configures `REDIS_URL`)
5. Deploy

## Security

- Keep your CDP API credentials secure
- Never commit `.env` files
- Rotate API keys if compromised
- Use Vercel environment variables for production
- **Rate limiting**: 20 wallets per IP per day to prevent abuse
- See [SECURITY.md](SECURITY.md) for detailed security guidelines

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [CDP Server Wallets v2 Documentation](https://docs.cdp.coinbase.com/wallet-api/docs/welcome)
- [Vercel Deployment](https://vercel.com/docs)

## License

MIT
