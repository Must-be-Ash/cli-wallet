# Importing Accounts

## Overview

The CDP Wallet API offers a secure method for creating EVM and Solana Accounts from imported private keys.

The import flow is end-to-end encrypted between the CDP SDK and the [TEE](/wallet-api/v2/introduction/security#tee-architecture), ensuring that keys are never exposed outside of the secure enclave during the request.
Encrypted by the SDK in a way that only the TEE can decrypt the keys, this process enables seamless and secure import of your keys into v2 accounts.

This feature can be used to import wallets from external wallet providers and the [v1 Wallet API](/wallet-api/v1/introduction/welcome).

## EVM Accounts: Import from external wallet providers

You can import private keys from other wallet providers by exporting them as raw, hex-encoded 32-byte strings.

To complete the import, use `importAccount` in TypeScript or `import_account` in the Python CDP SDK.
Only private key import is supported. To import an HD Wallet, derive individual private keys from the seed and import them one by one.

<CodeGroup>
  ```ts TypeScript lines wrap
      import { CdpClient } from "@coinbase/cdp-sdk";
      import dotenv from "dotenv";

      dotenv.config();

      const cdp = new CdpClient();
      const account = await cdp.evm.importAccount({
          privateKey: "0x0123456789abcdef...",
          name: "ExternalWalletImportedAccount",
      });
      console.log("Imported account: ", account.address);
  ```

  ```python Python lines wrap
      import asyncio
      from cdp import CdpClient
      from dotenv import load_dotenv

      load_dotenv()

      async def main():
          async with CdpClient() as cdp:
              account = await cdp.evm.import_account(
                  private_key="0x0123456789abcdef...",
                  name="ExternalWalletImportedAccount",
              )
              print("Imported account: ", account.address)

      asyncio.run(main())
  ```
</CodeGroup>

## Solana Accounts: Import from external wallet providers

Here's an example of how to import a Solana account with a base58-encoded private key from a wallet provider like Phantom.

<CodeGroup>
  ```ts TypeScript lines wrap
      import { CdpClient } from "@coinbase/cdp-sdk";
      import dotenv from "dotenv";

      dotenv.config();

      const cdp = new CdpClient();
      const account = await cdp.solana.importAccount({
          privateKey: "4YFq9y5f5hi77Bq8kDCE6VgqoAq...",
          name: "ExternalWalletImportedAccount",
      });
      console.log("Imported account: ", account.address);
  ```

  ```python Python lines wrap
      import asyncio
      from cdp import CdpClient
      from dotenv import load_dotenv

      load_dotenv()

      async def main():
          async with CdpClient() as cdp:
              account = await cdp.solana.import_account(
                  private_key="4YFq9y5f5hi77Bq8kDCE6VgqoAq...",
                  name="ExternalWalletImportedAccount",
              )
              print("Imported account: ", account.address)

      asyncio.run(main())
  ```
</CodeGroup>

You can also import a Solana account using the raw 32-byte private key array.

<CodeGroup>
  ```ts TypeScript lines wrap
      import { CdpClient } from "@coinbase/cdp-sdk";
      import dotenv from "dotenv";

      dotenv.config();

      const keypair = Keypair.generate();
      const privateKeyBytes32 = keypair.secretKey.subarray(0, 32);

      const account = await cdp.solana.importAccount({
          privateKey: privateKeyBytes32,
          name: "BytesAccount32",
      });
      console.log("Imported account: ", account.address);
  ```

  ```python Python lines wrap
      import asyncio
      from cdp import CdpClient
      from dotenv import load_dotenv

      load_dotenv()

      async def main():
          async with CdpClient() as cdp:
              keypair = Keypair.generate()
              private_key_bytes32 = keypair.secret_key[:32]

              account = await cdp.solana.import_account(
                  private_key=private_key_bytes32,
                  name="BytesAccount32",
              )
              print("Imported account: ", account.address)

      asyncio.run(main())
  ```
</CodeGroup>

## Import [developer-managed v1 Wallets](/wallet-api/v1/concepts/wallets/#developer-managed-wallets)

A key difference between v1 wallets and v2 accounts is that v1 wallets are HD Wallets, while v2 accounts are single-address accounts.
Import each address from your v1 wallet as an individual v2 account, following the steps below.

First, set up a new project and install dependencies

```ts TypeScript lines wrap
    mkdir import-example && cd import-example
    npm init -y && npm pkg set type="module"
    npm install @coinbase/coinbase-sdk @coinbase/cdp-sdk dotenv
```

The below script does the following to import from v1 wallets to v2:

1. Export private key of v1 address using v1 SDK
2. Import private keys as a v2 account using v2 SDK

   ```ts TypeScript lines wrap [expandable]
       // Step 1: Export private keys of v1 address.
       import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
       import { CdpClient } from "@coinbase/cdp-sdk";
       import dotenv from "dotenv";

       dotenv.config();

       // Change this to the path of your API key file downloaded from CDP portal.
       Coinbase.configureFromJson({ filePath: "~/Downloads/cdp_api_key.json" });

       // Add the ID of the wallet and its seed to import.
       const wallet_id = ''
       const seed = ''

       // Fetch the wallet and set the seed.
       let wallet = await Wallet.fetch(wallet_id);
       // You can also load the seed using loadSeedFromFile call.
       await wallet.setSeed(seed);

       console.log(`Wallet successfully fetched: `, wallet.toString());

       // Export private key of the default address.
       let address = await wallet.getDefaultAddress();
       let privateKey = address.export();

       // Step 2: Import exported private key as a v2 account.
       const cdp = new CdpClient();
       const account = await cdp.evm.importAccount({
         privateKey: privateKey,
         name: "ImportedAccount",
       });

       console.log("Imported account: ", account.address);
   ```

## Import [Coinbase-managed v1 Wallets](/wallet-api/v1/concepts/wallets/#coinbase-managed-wallets)

Coinbase-Managed v1 wallets use Multi-Party Computation to split the private key shares between Coinbase and the developer.

These wallets do not support private key export today.
Therefore, to migrate these wallets, you must create a new v2 account and transfer funds onchain from your existing v1 addresses.
The v1 SDK's [gasless sends](/wallet-api/v1/concepts/transfers#gasless-transfers) feature can be used for a zero-cost migration.

Create new v2 accounts for each address in your v1 wallet and transfer funds to them using the steps below:

1. Fetch the v1 wallet using v1 SDK
2. Create new v2 account using v2 SDK
3. Send funds from v1 address to the new v2 account using v1 SDK

   ```typescript index.js lines wrap [expandable]
   import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
   import { CdpClient } from "@coinbase/cdp-sdk";
   import dotenv from "dotenv";

   dotenv.config();

   // Step 1: Fetch the v1 wallet.
   // Change this to the path of your API key file downloaded from CDP portal.
   Coinbase.configureFromJson({ filePath: "~/Downloads/cdp_api_key.json" });
   Coinbase.useServerSigner = true;

   // Add the ID of the v1 wallet.
   const wallet_id = ''
   let v1_wallet = await Wallet.fetch(wallet_id);

   console.log(`Wallet successfully fetched: `, v1_wallet.toString());

   // Step 2: Create a new v2 account.
   const cdp = new CdpClient();

   let v2_account = await cdp.evm.createAccount({
       name: "NewAccount",
   });

   console.log(`Created account: ${v2_account} successfully`);

   let balance = await v1_wallet.getBalance(Coinbase.assets.Usdc);
   let transfer;

   // Step 3: Send funds from v1 address to v2 account using gasless sends feature.
   try {
        transfer = await v1_wallet.createTransfer({
           amount: balance,
           assetId: Coinbase.assets.Usdc,
           destination: v2_account.address,
           gasless: true,
       });
   } catch (e) {
         console.error(`Error transferring funds: ${e}`)
   }

   // Wait for the transfer to land on-chain.
   try {
      transfer = await transfer.wait();
   } catch (err) {
       if (err instanceof TimeoutError) {
           console.log("Waiting for transfer timed out");
       } else {
           console.error("Error while waiting for transfer to complete: ", error);
       }
   }

   // Check if transfer successfully completed on-chain.
   if (transfer.getStatus() === 'complete') {
       console.log('Transfer completed on-chain: ', transfer.toString());
   } else {
       console.error('Transfer failed on-chain: ', transfer.toString());
   }
   ```

## Video: Watch and learn

**Watch this video for a walkthrough of importing keys:**

<Frame>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/sRQ7SA0pSdw" title="Importing Keys Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</Frame>

## What to read next

* [**v2 Wallet Security**](/wallet-api/v2/introduction/security): Learn more about the security features of the CDP v2 Wallet API.
* [**Policies**](/wallet-api/v2/using-the-wallet-api/policies): Learn more about governing behavior of v2 accounts.
* [**Exporting Accounts**](/wallet-api/v2/using-the-wallet-api/export-accounts): Learn more about exporting EVM and Solana accounts.
