# Managing Accounts

## Creating Accounts

You can assign a name to an account to make it easier to access. Account names can consist of alphanumeric characters and hyphens, and must be between 2 and 36 characters long. Account names must be unique within a single CDP project for each account type (e.g., all Solana accounts).

You can assign an account name at the time of account creation, and retrieve it later using the name. The `getOrCreateAccount` method will create an account if it doesn't exist, and return the existing account if it does.

### EVM Accounts

You can create EVM accounts with or without names. Here are examples of both approaches:

<CodeGroup>
  ```ts TypeScript lines wrap 
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  const account = await cdp.evm.createAccount();
  console.log(`Created account. Address: ${account.address}.`);

  const namedAccount = await cdp.evm.getOrCreateAccount({
    name: "MyAccount"
  });
  console.log(`Created account with name ${account.name}.`);
  ```

  ```python Python lines wrap 
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main(): 
      async with CdpClient() as cdp:
          account = await cdp.evm.create_account()
          print(f"Created account. Address: {account.address}.")

          named_account = await cdp.evm.get_or_create_account(name="MyAccount")
          print(f"Created account with name {named_account.name}.")

  asyncio.run(main())
  ```
</CodeGroup>

### Smart Accounts

You can also create and manage smart accounts that are owned by an EVM account. Each owner account can only have one smart account associated with it. The `getOrCreateSmartAccount` method will create a smart account if it doesn't exist for the owner, and return the existing smart account if it does.

<CodeGroup>
  ```ts TypeScript lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  // Create a couple of owners, one for each smart account we will create.
  const firstOwner = await cdp.evm.getOrCreateAccount({
    name: "ExampleOwner1"
  });
  const secondOwner = await cdp.evm.getOrCreateAccount({
    name: "ExampleOwner2"
  });

  const account = await cdp.evm.createSmartAccount({ 
    owner: firstOwner,
  });
  console.log("Created Smart Account. Address:", account.address);

  const namedSmartAccount = await cdp.evm.getOrCreateSmartAccount({ 
    name: "MySmartAccount", 
    owner: secondOwner
  });
  console.log("Created Smart Account:", sameAccount.address);
  ```

  ```python Python lines wrap
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main():
      async with CdpClient() as cdp:
          # Create a couple of owners, one for each smart account we will create.
          first_owner = await cdp.evm.get_or_create_account(name="ExampleOwner1")
          second_owner = await cdp.evm.get_or_create_account(name="ExampleOwner2")

          account = await cdp.evm.create_smart_account(
              owner=first_owner
          )
          print("Created Smart Account. Address:", account.address)

          named_account = await cdp.evm.get_or_create_smart_account(
              name="MySmartAccount",
              owner=second_owner
          )
          print("Created Smart Account:", named_account.address)

  asyncio.run(main())
  ```
</CodeGroup>

### Solana Accounts

You can create Solana accounts with or without names. Here are examples of both approaches:

<CodeGroup>
  ```ts TypeScript lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  const account = await cdp.solana.createAccount();
  console.log(`Created account. Address: ${account.address}.`);

  const namedAccount = await cdp.solana.getOrCreateAccount({
    name: "MyAccount"
  });
  console.log(`Created account with name ${namedAccount.name}.`);
  ```

  ```python Python lines wrap
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main():
      async with CdpClient() as cdp:
          account = await cdp.solana.create_account()
          print(f"Created account. Address: {account.address}.")

          named_account = await cdp.solana.get_or_create_account(name="MyAccount")
          print(f"Created account with name {named_account.name}.")

  asyncio.run(main())
  ```
</CodeGroup>

## Managing Existing Accounts

Once you've created accounts, you can retrieve, list, and update them as needed.

### Getting Accounts by Address or Name

You can retrieve a specific account by its address or name using the `getAccount` method.

<CodeGroup>
  ```ts TypeScript lines wrap
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  // Returns the account with the given address, if it exists.
  const account = await cdp.evm.getAccount({
    address: "0x1234567890123456789012345678901234567890"
  });

  // Returns the account with the given name, if it exists.
  const namedAccount = await cdp.evm.getAccount({
    name: "MyAccount"
  });
  ```

  ```python Python lines wrap
  import asyncio
  from cdp import CdpClient
  import dotenv

  async def main():
      async with CdpClient() as cdp:
          # Returns the account with the given address, if it exists.
          account = await cdp.evm.get_account(
              address="0x1234567890123456789012345678901234567890"
          )

          # Returns the account with the given name, if it exists.
          named_account = await cdp.evm.get_account(
              name="MyAccount"
          )
  ```
</CodeGroup>

### Listing All Accounts

You can list all accounts of a specific type in a single CDP project by calling the `listAccounts` method:

<CodeGroup>
  ```ts TypeScript lines wrap [expandable]
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();
  let response = await cdp.evm.listAccounts();

  // Paginate through all accounts.
  while (true) {
    for (const account of response.accounts) {
      console.log('EVM account:', account.address);
    }
    
    if (!response.nextPageToken) break;
    
    response = await cdp.evm.listAccounts({
      pageToken: response.nextPageToken
    });
  }
  ```

  ```python Python lines wrap [expandable]
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main(): 
      async with CdpClient() as cdp:
          response = await cdp.evm.list_accounts()
          
          while True:
              for account in response.accounts:
                  print('EVM account:', account.address)
                  
              if not response.next_page_token:
                  break
                  
              response = await cdp.evm.list_accounts(
                  page_token=response.next_page_token
              )

  asyncio.run(main())
  ```
</CodeGroup>

### Updating Accounts

After creating an account, you can modify various properties including the account name and attach policies to govern account behavior.

#### Changing Account Names

You can change the name of an existing account using the `updateAccount` method:

<CodeGroup>
  ```ts TypeScript lines wrap 
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  // Get an existing account
  const account = await cdp.evm.getOrCreateAccount({
    name: "original-name"
  });
  console.log(`Original account name: ${account.name}`);

  // Update the account name
  const updatedAccount = await cdp.evm.updateAccount({
    address: account.address,
    update: {
      name: "new-name",
    },
  });
  console.log(`Updated account name: ${updatedAccount.name}`);
  ```

  ```python Python lines wrap 
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main(): 
      async with CdpClient() as cdp:
          # Get an existing account
          account = await cdp.evm.get_or_create_account(name="original-name")
          print(f"Original account name: {account.name}")

          # Update the account name
          updated_account = await cdp.evm.update_account(
              address=account.address,
              update={
                  "name": "new-name",
              },
          )
          print(f"Updated account name: {updated_account.name}")

  asyncio.run(main())
  ```
</CodeGroup>

#### Attaching Policies

You can attach [policies](/wallet-api/v2/using-the-wallet-api/policies) to accounts to govern their behavior, such as restricting transactions to specific addresses or limiting transaction values. Policies can be attached during account creation or added later using the `updateAccount` method:

<CodeGroup>
  ```ts TypeScript lines wrap 
  import { CdpClient } from "@coinbase/cdp-sdk";
  import "dotenv/config";

  const cdp = new CdpClient();

  // Get an existing account
  const account = await cdp.evm.getOrCreateAccount({
    name: "policy-account"
  });

  const policyId = "your-policy-id"; // Replace with your actual policy ID

  // Attach a policy to the account
  const updatedAccount = await cdp.evm.updateAccount({
    address: account.address,
    update: {
      accountPolicy: policyId,
    },
  });
  console.log(`Updated account ${updatedAccount.address} with policy: ${updatedAccount.policies}`);
  ```

  ```python Python lines wrap 
  import asyncio
  from cdp import CdpClient
  import dotenv

  dotenv.load_dotenv()

  async def main(): 
      async with CdpClient() as cdp:
          # Get an existing account
          account = await cdp.evm.get_or_create_account(name="policy-account")

          policy_id = "your-policy-id"  # Replace with your actual policy ID

          # Attach a policy to the account
          updated_account = await cdp.evm.update_account(
              address=account.address,
              update={
                  "account_policy": policy_id,
              },
          )
          print(f"Updated account {updated_account.address} with policy: {updated_account.policies}")

  asyncio.run(main())
  ```
</CodeGroup>

<Note>
  To learn more about creating and managing policies, see the [Policies](/wallet-api/v2/using-the-wallet-api/policies) documentation.
</Note>

### Account Manager UI

You can also manage account in the [CDP Portal Account Manager UI](https://portal.cdp.coinbase.com/products/wallet-api/accounts). From here you can
view your accounts by chain and type, and you can click into an account to view more information like balances and policies.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/wallet-api/images/account-manager-ui.png" alt="Account Manager UI" />
</Frame>
