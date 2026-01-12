/**
 * Response structure for EOA wallet creation
 */
export interface EOAWalletResponse {
    success: boolean;
    accountType: "eoa";
    address: string;
    privateKey: string;
    network: string;
}
/**
 * Response structure for Smart Account wallet creation
 */
export interface SmartAccountResponse {
    success: boolean;
    accountType: "smart-account";
    smartAccountAddress: string;
    ownerAddress: string;
    ownerPrivateKey: string;
    network: string;
    note?: string;
}
/**
 * Error response structure
 */
export interface ErrorResponse {
    success: false;
    error: string;
    accountType?: string;
}
/**
 * Request structure for onramp session creation
 */
export interface OnrampSessionRequest {
    address: string;
    presetAmount?: string;
}
/**
 * Response structure for onramp session creation
 */
export interface OnrampSessionResponse {
    success: boolean;
    onrampUrl: string;
    expiresIn?: string;
}
/**
 * Request structure for testnet faucet
 */
export interface FaucetRequest {
    address: string;
}
/**
 * Response structure for testnet faucet
 */
export interface FaucetResponse {
    success: boolean;
    transactionHash: string;
    network: string;
    token: string;
    amount: string;
    explorerUrl: string;
}
/**
 * Create an EOA wallet
 */
export declare function createEOAWallet(): Promise<EOAWalletResponse>;
/**
 * Create a Smart Account wallet
 */
export declare function createSmartAccountWallet(): Promise<SmartAccountResponse>;
/**
 * Create an onramp session and get onramp URL
 */
export declare function createOnrampSession(request: OnrampSessionRequest): Promise<OnrampSessionResponse>;
/**
 * Request testnet USDC from the faucet
 */
export declare function requestTestnetFaucet(request: FaucetRequest): Promise<FaucetResponse>;
//# sourceMappingURL=api-client.d.ts.map