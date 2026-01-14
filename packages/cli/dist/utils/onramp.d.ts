/**
 * Generate Coinbase Pay onramp URL for funding a wallet with USDC
 * Uses backend API to create a session-based onramp URL with session token
 *
 * @param address - The wallet address to fund
 * @param presetAmount - Optional USD amount to preset (e.g., "100")
 * @param blockchain - Blockchain network ("base" or "solana")
 * @returns Complete Coinbase Pay URL with session token
 */
export declare function generateOnrampURL(address: string, presetAmount?: string, blockchain?: "base" | "solana"): Promise<string>;
/**
 * Display onramp instructions with funding link
 *
 * @param address - The wallet address to fund
 * @param presetAmount - Optional USD amount to preset (e.g., "100")
 * @param blockchain - Blockchain network ("base" or "solana")
 */
export declare function displayOnrampInstructions(address: string, presetAmount?: string, blockchain?: "base" | "solana"): Promise<void>;
//# sourceMappingURL=onramp.d.ts.map