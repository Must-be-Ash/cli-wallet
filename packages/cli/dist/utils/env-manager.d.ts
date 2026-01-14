import { EOAWalletResponse, SmartAccountResponse, SolanaWalletResponse } from "./api-client.js";
/**
 * Save wallet credentials to .env file in the current directory
 */
export declare function saveToEnvFile(wallet: EOAWalletResponse | SmartAccountResponse | SolanaWalletResponse): Promise<string>;
/**
 * Ensure .gitignore includes .env
 */
export declare function ensureGitignore(): Promise<void>;
//# sourceMappingURL=env-manager.d.ts.map