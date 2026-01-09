# Wallet API v2: Quickstart

## Overview

The v2 Wallet API allows you to create [accounts](/wallet-api/v2/introduction/accounts) on EVM compatible networks and the Solana network.

In this quickstart, you will learn how to:

* Create EVM and Solana accounts
* Fund your accounts with testnet tokens using CDP Faucets
* Send a transaction using `viem` for Typescript or `web3` for Python

## Prerequisites

Setup all dependencies, export your keys to environment variables, and initialize a new project before you begin.

It is assumed you have:

* [Node.js](https://nodejs.org/en) 22.x+ if using Typescript
* [Python](https://www.python.org/downloads/) 3.10+ if using Python
* [Created](https://portal.cdp.coinbase.com/create-account) and [signed in](https://portal.cdp.coinbase.com/signin) to an existing CDP account

Once you have setup the prerequisite dependencies, continue reading to create keys to authenticate your requests and initialize a new project.

### Create keys

Sign in to the [CDP Portal](https://portal.cdp.coinbase.com), [create a CDP API key](https://portal.cdp.coinbase.com/projects/api-keys) and [generate a Wallet Secret](https://portal.cdp.coinbase.com/products/wallet-api).
Keep these values handy as you will need them in the following steps.

For more information, see the [CDP API Keys](/get-started/authentication/cdp-api-keys#secret-api-keys) and [Wallet Secret](/wallet-api/v2/introduction/security#wallet-secret) documentation.

### Project setup

After creating your keys, initialize a new project and instantiate the CDP client.

<Tabs groupId="programming-language">
  <Tab value="Typescript" title="Typescript" default>
    Initialize a new Typescript project by running:

    ```bash
    mkdir cdp-sdk-example && cd cdp-sdk-example && npm init -y && npm pkg set type="module" && touch main.ts && touch .env
    ```

    Add your CDP API key and wallet secret to the `.env` file:

    ```bash .env
    CDP_API_KEY_ID=your-api-key-id
    CDP_API_KEY_SECRET=your-api-key-secret
    CDP_WALLET_SECRET=your-wallet-secret
    ```

    Now, install the [CDP SDK](https://github.com/coinbase/cdp-sdk) and the [dotenv](https://www.npmjs.com/package/dotenv) packages:

    ```bash
    npm install @coinbase/cdp-sdk dotenv
    ```

    Finally, in `main.ts`, instantiate the CDP client:

    ```typescript main.ts lines wrap [expandable]
    import { CdpClient } from "@coinbase/cdp-sdk";
    import dotenv from "dotenv";

    dotenv.config();

    // Initialize the CDP client, which automatically loads
    // the API Key and Wallet Secret from the environment
    // variables.
    const cdp = new CdpClient();
    ```

    In this and in the following examples, you can run your code by running:

    ```bash
    npx tsx main.ts
    ```
  </Tab>

  <Tab value="Python" title="Python">
    Initialize a new Python project by running:

    ```bash
    mkdir cdp-sdk-example && cd cdp-sdk-example && python -m venv .venv && source .venv/bin/activate && touch main.py && touch .env
    ```

    Add your CDP API key and wallet secret to the `.env` file:

    ```bash .env
    CDP_API_KEY_ID=your-api-key-id
    CDP_API_KEY_SECRET=your-api-key-secret
    CDP_WALLET_SECRET=your-wallet-secret
    ```

    Now, install the [CDP SDK](https://github.com/coinbase/cdp-sdk) and the [python-dotenv](https://pypi.org/project/python-dotenv/) package:

    ```bash
    pip install cdp-sdk python-dotenv
    ```

    Finally, in `main.py`, instantiate the CDP client:

    ```python title="main.py"
    from cdp import CdpClient
    import asyncio
    from dotenv import load_dotenv

    load_dotenv()

    async def main():
        # Initialize the CDP client, which automatically loads
        # the API Key and Wallet Secret from the environment
        # variables.
        cdp = CdpClient()
        await cdp.close()


    asyncio.run(main())
    ```

    In this and in the following examples, you can run your code by running:

    ```bash
    python main.py
    ```
  </Tab>
</Tabs>

## 1. Create an account

The v2 Wallet API offers support for both [EVM compatible accounts and Solana accounts](/wallet-api/v2/introduction/accounts).

### EVM

To create an EVM account, see below:

<CodeGroup>
  ```typescript main.ts lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import dotenv from "dotenv";

  dotenv.config();

  const cdp = new CdpClient();
  const account = await cdp.evm.createAccount();
  console.log(`Created EVM account: ${account.address}`);
  ```

  ```python main.py lines wrap
  import asyncio
  from cdp import CdpClient
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      cdp = CdpClient()
      account = await cdp.evm.create_account()
      print(f"Created EVM account: {account.address}")
      await cdp.close()


  asyncio.run(main())
  ```
</CodeGroup>

After running the above snippet, you should see similar output:

```console lines wrap
Created EVM account: 0x3c0D84055994c3062819Ce8730869D0aDeA4c3Bf
```

<Tip>
  You can also create accounts with human-readable names and retrieve them later using the `getOrCreateAccount` method.

  See the [Managing Accounts](/wallet-api/v2/using-the-wallet-api/managing-accounts#account-names) guide for more information.
</Tip>

### Solana

To create a Solana account, see below:

<CodeGroup>
  ```typescript main.ts lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import dotenv from "dotenv";

  dotenv.config();

  const cdp = new CdpClient();       
  const account = await cdp.solana.createAccount();
  console.log(`Created Solana account: ${account.address}`);
  ```

  ```python main.py lines wrap
  import asyncio
  from cdp import CdpClient
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      cdp = CdpClient()    
      account = await cdp.solana.create_account()
      print(f"Created Solana account: {account.address}")
      await cdp.close()


  asyncio.run(main())
  ```
</CodeGroup>

After running the above snippet, you should see similar output:

```console lines wrap
Created Solana account: 2XBS6naS1v7pXEg25z43FGHnmEgEad53fmiZ9S6LPgKn
```

## 2. Fund account with test funds

Accounts do not have funds on creation. We provide a [Faucet API](/faucets/introduction/welcome) to easily fund your EVM account with testnet tokens and Solana account with devnet tokens.

<Info>
  Before you request funds, ensure you read about [rate limits when using CDP Faucets](/faucets/introduction/welcome#supported-assets).
</Info>

### EVM

<CodeGroup>
  ```typescript main.ts lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import dotenv from "dotenv";

  dotenv.config();

  const cdp = new CdpClient();

  const account = await cdp.evm.createAccount();
  const faucetResponse = await cdp.evm.requestFaucet({
    address: account.address,
    network: "base-sepolia",
    token: "eth"
  });
  console.log(`Requested funds from ETH faucet: https://sepolia.basescan.org/tx/${faucetResponse.transactionHash}`);
  ```

  ```python main.py lines wrap
  import asyncio
  from cdp import CdpClient
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      cdp = CdpClient()
      
      account = await cdp.evm.create_account()
      
      faucet_hash = await cdp.evm.request_faucet(
          address=account.address,
          network="base-sepolia",
          token="eth"
      )
      print(f"Requested funds from ETH faucet: https://sepolia.basescan.org/tx/{faucet_hash}")

      await cdp.close()


  asyncio.run(main())
  ```
</CodeGroup>

After running the above, you should see similar output:

```console lines wrap
Requested funds from ETH faucet: https://sepolia.basescan.org/tx/0x9e93a16f2ca67f35bcb1ea2933f19035ae1e71ff3100d2abc6a22ce024d085ec
```

### Solana

<CodeGroup>
  ```typescript main.ts lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import dotenv from "dotenv";

  dotenv.config();

  const cdp = new CdpClient();

  const account = await cdp.solana.createAccount();

  const { signature } = await cdp.solana.requestFaucet({
    address: account.address,
    token: "sol"
  });
  console.log(`Requested funds from Solana faucet: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  ```

  ```python main.py lines wrap
  import asyncio
  from cdp import CdpClient
  from dotenv import load_dotenv

  load_dotenv()

  async def main():
      cdp = CdpClient()

      account = await cdp.solana.create_account()

      tx_signature_response = await cdp.solana.request_faucet(
          address=account.address,
          token="sol"
      )

      print(f"Requested funds from Solana faucet: https://explorer.solana.com/tx/{tx_signature_response.transaction_signature}?cluster=devnet")

      await cdp.close()


  asyncio.run(main())
  ```
</CodeGroup>

After running the above, you should see similar output:

```console lines wrap
Requested funds from Solana faucet: https://explorer.solana.com/tx/4KEPbhkRLTg2FJNqV5bbUd6zv1TNkksxF9PDHw2FodrTha3jq2Cojn4hSKtjPWdrZiRDuYp7okRuc1oYvh3JkLuE?cluster=devnet
```

## 3. Send a transaction

### EVM

<Tabs groupId="programming-language">
  <Tab value="Typescript" title="Typescript" default>
    You can send transactions using the v2 Wallet API.

    Note that in order to wait for transaction confirmation, you will need to have `viem` installed:

    ```bash
    npm install viem
    ```

    In the example below, we:

    1. Create a new EVM account.
    2. Request ETH from the faucet.
    3. Use the v2 Wallet API to send a transaction.
    4. Wait for transaction confirmation.

    ```typescript main.ts lines wrap [expandable]
    import { CdpClient } from "@coinbase/cdp-sdk";
    import { http, createPublicClient, parseEther } from "viem";
    import { baseSepolia } from "viem/chains";
    import dotenv from "dotenv";

    dotenv.config();

    const cdp = new CdpClient();

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    // Step 1: Create a new EVM account.
    const account = await cdp.evm.createAccount();
    console.log("Successfully created EVM account:", account.address);

    // Step 2: Request ETH from the faucet.
    const { transactionHash: faucetTransactionHash } = await cdp.evm.requestFaucet({
      address: account.address,
      network: "base-sepolia",
      token: "eth",
    });

    const faucetTxReceipt = await publicClient.waitForTransactionReceipt({
      hash: faucetTransactionHash,
    });
    console.log("Successfully requested ETH from faucet:", faucetTxReceipt.transactionHash);

    // Step 3: Use the v2 Wallet API to send a transaction.
    const transactionResult = await cdp.evm.sendTransaction({
      address: account.address,
      transaction: {
        to: "0x0000000000000000000000000000000000000000",
        value: parseEther("0.000001"),
      },
      network: "base-sepolia",
    });

    // Step 4: Wait for the transaction to be confirmed
    const txReceipt = await publicClient.waitForTransactionReceipt({
      hash: transactionResult.transactionHash,
    });

    console.log(
      `Transaction sent! Link: https://sepolia.basescan.org/tx/${transactionResult.transactionHash}`
    );
    ```
  </Tab>

  <Tab value="Python" title="Python">
    You can send transactions using the v2 Wallet API.

    Note that in order to wait for transaction confirmation, you will need to have `web3` installed:

    ```bash
    pip install web3
    ```

    In the example below, we:

    1. Create a new EVM account.
    2. Request ETH from the faucet.
    3. Use the v2 Wallet API to send a transaction.
    4. Wait for transaction confirmation.

    ```python main.py lines wrap [expandable]
    import asyncio

    from cdp import CdpClient
    from cdp.evm_transaction_types import TransactionRequestEIP1559

    from dotenv import load_dotenv
    from web3 import Web3

    load_dotenv()

    w3 = Web3(Web3.HTTPProvider("https://sepolia.base.org"))


    async def main():
        async with CdpClient() as cdp:
            account = await cdp.evm.create_account()
            print(f"Created account: {account.address}")

            faucet_hash = await cdp.evm.request_faucet(
                address=account.address, network="base-sepolia", token="eth"
            )

            w3.eth.wait_for_transaction_receipt(faucet_hash)
            print(f"Received funds from faucet for address: {account.address}")

            tx_hash = await cdp.evm.send_transaction(
                address=account.address,
                transaction=TransactionRequestEIP1559(
                    to="0x0000000000000000000000000000000000000000",
                    value=w3.to_wei(0.000001, "ether"),
                ),
                network="base-sepolia",
            )


            print(f"Transaction sent! Link: https://sepolia.basescan.org/tx/{tx_hash}")


    asyncio.run(main())
    ```
  </Tab>
</Tabs>

### Solana

<Tabs groupId="programming-language">
  <Tab value="Typescript" title="Typescript" default>
    You can send transactions on Solana using the [`@solana/web3.js`](https://solana.com/docs/clients/javascript) v1 library.

    ```bash
    npm install @solana/web3.js@1
    ```

    In the example below, we:

    1. Create a new Solana account.
    2. Request SOL from the faucet.
    3. Wait for funds to become available.
    4. Send the transaction to a specified address.

    ```typescript main.ts lines wrap [expandable]
    import {
      Connection,
      PublicKey,
      SystemProgram,
      Transaction,
    } from "@solana/web3.js";
    import { CdpClient } from "@coinbase/cdp-sdk";
    import dotenv from "dotenv";

    dotenv.config();

    const cdp = new CdpClient();

    const connection = new Connection("https://api.devnet.solana.com");

    async function createAccount() {
      const account = await cdp.solana.createAccount();
      console.log(`Created account: ${account.address}`);
      return account;
    }

    async function requestFaucet(address: string) {
      await cdp.solana.requestFaucet({
        address,
        token: "sol",
      });
    }

    async function waitForBalance(address: string) {
      let balance = 0;
      let attempts = 0;
      const maxAttempts = 30;

      while (balance === 0 && attempts < maxAttempts) {
        balance = await connection.getBalance(new PublicKey(address));
        if (balance === 0) {
          console.log("Waiting for funds...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } else {
          console.log("Account funded with", balance / 1e9, "SOL");
        }
      }

      if (balance === 0) {
        throw new Error("Account not funded after multiple attempts");
      }
    }

    async function sendTransaction(address: string) {
      // Amount of lamports to send (default: 1000 = 0.000001 SOL)
      const lamportsToSend = 1000;
      const fromAddress = new PublicKey(address)
      const toAddress = new PublicKey("EeVPcnRE1mhcY85wAh3uPJG1uFiTNya9dCJjNUPABXzo");

      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromAddress,
          toPubkey: toAddress,
          lamports: lamportsToSend,
       })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromAddress;

      const serializedTx = Buffer.from(
        transaction.serialize({ requireAllSignatures: false })
      ).toString("base64");

      const { signature: txSignature } = await cdp.solana.signTransaction({
        address,
        transaction: serializedTx,
      });
      const decodedSignedTx = Buffer.from(txSignature, "base64");

      console.log("Sending transaction...");
      const txSendSignature = await connection.sendRawTransaction(decodedSignedTx);

      const latestBlockhash = await connection.getLatestBlockhash();

      console.log("Waiting for transaction to be confirmed...");
      const confirmation = await connection.confirmTransaction({
        signature: txSendSignature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      console.log(`Sent SOL: https://explorer.solana.com/tx/${txSendSignature}?cluster=devnet`);
    }

    async function main() {
      const account = await createAccount();
      await requestFaucet(account.address);
      await waitForBalance(account.address);
      await sendTransaction(account.address);
    }

    main().catch(console.error)
    ```
  </Tab>

  <Tab value="Python" title="Python">
    You can send transactions on Solana using the [`solana`](https://solana.com/docs/clients/python) library.

    ```bash
    pip install solana solders
    ```

    In the example below, we:

    1. Create a new Solana account.
    2. Request SOL from the faucet.
    3. Wait for funds to become available.
    4. Send the transaction to a specified address.

    ```python main.py lines wrap [expandable]
    import time
    import base64
    import asyncio
    from cdp import CdpClient
    from dotenv import load_dotenv
    from solana.rpc.api import Client as SolanaClient
    from solana.rpc.types import TxOpts
    from solders.pubkey import Pubkey as PublicKey
    from solders.system_program import TransferParams, transfer
    from solders.message import Message

    load_dotenv()

    cdp = CdpClient()

    connection = SolanaClient("https://api.devnet.solana.com")

    async def create_sol_account():
        account = await cdp.solana.create_account()
        print(f"Created account: {account.address}")
        return account


    async def request_faucet(address: str):
        await cdp.solana.request_faucet(
            address,
            token="sol"
        )


    async def wait_for_balance(address: str):
        balance = 0
        max_attempts = 30
        attempts = 0

        while balance == 0 and attempts < max_attempts:
            balance_resp = connection.get_balance(PublicKey.from_string(address))
            balance = balance_resp.value
            if balance == 0:
                print("Waiting for funds...")
                time.sleep(1)
                attempts += 1
            else:
                print(f"Account funded with {balance / 1e9} SOL ({balance} lamports)")

        if balance == 0:
            raise ValueError("Account not funded after multiple attempts")


    async def send_transaction(address: str):
        # Amount of lamports to send (default: 1000 = 0.000001 SOL)
        lamports_to_send = 1000;
        from_address = PublicKey.from_string(address)
        to_address = PublicKey.from_string("EeVPcnRE1mhcY85wAh3uPJG1uFiTNya9dCJjNUPABXzo")

        blockhash_resp = connection.get_latest_blockhash()
        blockhash = blockhash_resp.value.blockhash

        transfer_params = TransferParams(
            from_pubkey=from_address,
            to_pubkey=to_address,
            lamports=lamports_to_send,
        )
        transfer_instr = transfer(transfer_params)

        message = Message.new_with_blockhash(
            [transfer_instr],
            from_address,
            blockhash,
        )

        # Create a transaction envelope with signature space
        sig_count = bytes([1])  # 1 byte for signature count (1)
        empty_sig = bytes([0] * 64)  # 64 bytes of zeros for the empty signature
        message_bytes = bytes(message)  # Get the serialized message bytes

        # Concatenate to form the transaction bytes
        tx_bytes = sig_count + empty_sig + message_bytes

        # Encode to base64 used by CDP API
        serialized_tx = base64.b64encode(tx_bytes).decode("utf-8")

        signed_tx_response = await cdp.solana.sign_transaction(
            address,
            transaction=serialized_tx,
        )

        # Decode the signed transaction from base64
        decoded_signed_tx = base64.b64decode(signed_tx_response.signed_transaction)

        print("Sending transaction...")
        tx_resp = connection.send_raw_transaction(
            decoded_signed_tx,
            opts=TxOpts(skip_preflight=False, preflight_commitment="processed"),
        )
        signature = tx_resp.value

        print("Waiting for transaction to be confirmed...")
        confirmation = connection.confirm_transaction(signature, commitment="processed")

        if hasattr(confirmation, "err") and confirmation.err:
            raise ValueError(f"Transaction failed: {confirmation.err}")

        print(f"Sent SOL: https://explorer.solana.com/tx/{signature}?cluster=devnet")


    async def main():
        account = await create_sol_account()
        await request_faucet(account.address)
        await wait_for_balance(account.address)
        await send_transaction(account.address)

        await cdp.close()

    asyncio.run(main())
    ```
  </Tab>
</Tabs>

## Video: Watch and learn

Watch the video to learn about CDP Wallets and see a comprehensive demo, which covers:

* Overview of CDP Wallet API v2 features and capabilities
* Live demonstration of creating accounts and managing wallets
* Best practices for building with CDP Wallets

<Frame>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/_XMRgDU9a2Y" title="CDP Wallets Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</Frame>

## What to read next

* [v2 Wallet Accounts](/wallet-api/v2/introduction/accounts): An overview of the types of accounts supported by the v2 Wallet API.
* [Using Smart Accounts](/wallet-api/v2/evm-features/smart-accounts): A step-by-step guide on how to create and use smart accounts.
* [v2 Wallet Security](/wallet-api/v2/introduction/security): Learn about the security features of the v2 Wallet API.
* [Faucets](/faucets/introduction/welcome): Learn more on supported testnet assets and their associated rate limits.
