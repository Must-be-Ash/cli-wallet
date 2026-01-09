# Govern behavior using Policies

## Overview

CDP Wallets support **Policies** that enable developers to govern account and project behavior. Policies provide flexible configuration for enforcing controls based on transaction parameters such as destination address and transaction value.

### Use cases

* **Wallet transaction filtering:** Prevent transfers to known malicious or restricted addresses
* **Allowlisted access to project features:** Restrict access only to approved addresses to interact with a smart contract or mint a token
* **Transaction limits per address:** Limit financial risk by capping transaction values
* **Prevent signing of fraudulent messages:** Ensure compromised clients cannot prove control of your accounts

### Policy field definitions

A policy is defined by the following fields:

| Field       | Description                                                                                                              | Valid values                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `scope`     | The level at which a policy gets applied                                                                                 | `project` or `account`                                                                                              |
| `rules`     | A list of rules that are used to govern the behavior of accounts                                                         | An array of rules                                                                                                   |
| `action`    | The action to take when a policy is applied                                                                              | `accept` or `reject`                                                                                                |
| `operation` | The operation to perform when a policy is applied                                                                        | `signEvmTransaction`, `sendEvmTransaction`, `signEvmMessage`, `signEvmHash`, or `signSolTransaction`                |
| `criteria`  | The list of logical expressions that are evaluated to a transaction to determine whether a rule should be applied or not | An array of criteria. See [API Reference](/api-reference/v2/rest-api/policy-engine/policy-engine) for more details. |

### Evaluation process

A `project`-level policy will be evaluated first, followed by any `account`-level policies. Read more technical details on policy evaluation in the [API Reference documentation](/api-reference/v2/rest-api/policy-engine/policy-engine).

```json project-policy.json [expandable] lines wrap
{
  "description": "An example project level policy",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "1000000000000000000",
          "operator": "<="
        }
      ]
    },
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "2000000000000000000",
          "operator": "<="
        },
        {
          "type": "evmAddress",
          "addresses": [
            "0x123"
          ],
          "operator": "in"
        }
      ]
    }
  ]
}
```

<Accordion title="How would this policy be evaluated?">
  In this example, the policy has two rules. An incoming transaction would be processed against each rule as follows:

  1. Accept any transaction with a value less than or equal to 1 ETH (expressed in Wei).
  2. Accept any transaction with a value less than or equal to 2 ETH, and an address in the allowlist.

  Assume we have two transaction requests to the same address, 0x123:

  1. Transaction A with a value of 0.5 ETH
  2. Transaction B with a value of 2 ETH

  * **Transaction A** would be accepted on the first rule, and the policy engine would stop evaluation against this policy.
  * **Transaction B** would be processed against both rules. It would be rejected on the first rule, but accepted once processed against the second rule.
</Accordion>

### Supported operations

Each rule defines the behavior of a certain `operation`. The `operation` corresponds to a CDP v2 API. Currently, the following operations are supported:

* `signEvmTransaction`: To identify incoming signing transactions on an EVM compatible network
* `sendEvmTransaction`: To identify incoming signing transactions that are then sent to a supported network.
* `signEvmMessage`: To identify incoming messages to be signed by an account.
* `signEvmHash`: To identify incoming hash to be signed by an account.
* `signSolTransaction`: To identify incoming signing transactions on the Solana network

You can find more details in the [API reference documentation](/api-reference/v2/rest-api/policy-engine/policy-engine).

### API Key Configuration

In order to securely manage Policies via API or SDK, you'll need to manually configure an API key with a specific scope.

This scope is required to perform the following API operations:

* Create Policy
* Update Policy
* Delete Policy
* Account Policy assignment

When you're creating a new API Key, first expand the **API restrictions** panel then scroll down to the **API-specific restrictions** section.

Ensure that **Manage (modify policies)** is checked before key creation as seen in the following screenshot.

<Frame>
  ![Policies Scope](https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/wallet-api/images/manage-policies-api-scope.png)
</Frame>

## Define a policy

Policies can be defined via CDP Portal UI or via the CDP SDK.

<Note>
  You may only create one project-level policy per project.
</Note>

### UI (CDP Portal)

1. Navigate to [Policies](https://portal.cdp.coinbase.com/products/wallet-api/policy-engine) in the CDP Portal.
   <Frame>
     ![Policies UI](https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/wallet-api/images/policy-engine-dashboard.png)
   </Frame>

2. Click the **Create new policy** button to access the JSON editor. The modal will contain a sample policy that you can edit, but you can also use some of the [examples](#example-policies) below.

   <Frame>
     ![JSON Editor](https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/wallet-api/images/policy-engine-editor-modal.png)
   </Frame>

3. Define the policy and click the **Create** button. If successful, you should see a "Policy created" message.

4. Refresh the page to see the new policy listed in the Policies dashboard:

   <Frame>
     ![Policy Engine dashboard](https://mintlify.s3.us-west-1.amazonaws.com/coinbase-prod/wallet-api/images/policy-engine-policies-dashboard.png)
   </Frame>

   Click the **View** button to edit or delete the policy.

5. Account level policies should be added to the account programmatically via the SDK.

<CodeGroup>
  ```ts TypeScript lines wrap 
      import { CdpClient } from "@coinbase/cdp-sdk";
      import dotenv from "dotenv";

      dotenv.config();

      const cdp = new CdpClient();

      const account = await cdp.evm.createAccount();

      const policyId = "" // Paste the policy ID created on portal.

      // Update the account to add the account policy.
      const updatedAccount = await cdp.evm.updateAccount({
        address: account.address,
        update: {
          accountPolicy: policyId,
        }
      })

      console.log("Updated account %s with policy: %s", updatedAccount.address, updatedAccount.policies);
  ```

  ```python Python lines wrap 
          import asyncio

          from cdp import CdpClient
          from dotenv import load_dotenv
          from cdp.update_account_types import UpdateAccountOptions

          load_dotenv()

          async def main():
              async with CdpClient() as cdp:
                  account = await cdp.evm.create_account()

                  policy_id = "" # Paste the policy ID created on portal.

                  updatedAccount = await cdp.evm.update_account(
                                           address=account.address,
                                           update=UpdateAccountOptions(
                                             account_policy=policy_id,
                                           ),
                                         )

                  print(f"Updated account {account.address} with policy {updatedAccount.policies}")

          asyncio.run(main())
  ```
</CodeGroup>

### Programmatically

<Note>
  In order to manage Policies via SDK or API, you need to have an API Key with [Policy management enabled](#api-key-configuration)
</Note>

To create a policy programmatically, you can use the CDP SDK. The code below will:

1. Create an EVM account named `PolicyAccount`
2. Create an account-level policy that only allows transactions less than or equal to 1 ETH to the address `0x000000000000000000000000000000000000dEaD`
3. Apply the policy to the account we created
4. Create another account named `OtherPolicyAccount` which has the above policy applied during creation
5. Create a project-level policy that only allows transactions less than or equal to 5 ETH to the address `0x000000000000000000000000000000000000dEaD`

<Note>
  A project-level policy is automatically applied to all accounts in the project on creation.

  An account-level policy may be applied to an account in 2 ways: *during* account creation, or *after* account creation by updating the account.
</Note>

<CodeGroup>
  ```ts TypeScript [expandable] lines wrap
      import { CdpClient } from "@coinbase/cdp-sdk";

      const cdp = new CdpClient();

      const account = await cdp.evm.getOrCreateAccount({
        name: "PolicyAccount"
      });
      console.log("Account address:", account.address);

      // Create policy
      const policy = await cdp.policies.createPolicy({
        policy: {
          scope: "account",
          description: "Account Allowlist Example",
          rules: [
            {
              action: "accept",
              operation: "signEvmTransaction",
              criteria: [
                {
                  type: "ethValue",
                  ethValue: "1000000000000000000", // 1 ETH in wei
                  operator: "<=",
                },
                {
                  type: "evmAddress",
                  addresses: ["0x000000000000000000000000000000000000dEaD"],
                  operator: "in",
                },
              ],
            },
          ],
        },
      });
      console.log("Created policy:", policy.id);

      // Apply policy to the account
      const updatedAccount = await cdp.evm.updateAccount({
        address: account.address,
        update: {
          accountPolicy: policy.id
        }
      });
      console.log("Applied policy to account:", updatedAccount.address);

      // Create another account with policy immediately applied to it
      const otherAccount = await cdp.evm.createAccount({
        name: "OtherPolicyAccount",
        accountPolicy: policy.id
      });
      console.log("Other account address:", otherAccount.address);

      // Create project policy example
      const projectPolicy = await cdp.policies.createPolicy({
        policy: {
          scope: "project",
          description: "Project Transaction Limit Example",
          rules: [
            {
              action: "accept",
              operation: "signEvmTransaction",
              criteria: [
                {
                  type: "ethValue",
                  ethValue: "5000000000000000000", // 5 ETH in wei
                  operator: "<=",
                },
                {
                  type: "evmAddress",
                  addresses: ["0x000000000000000000000000000000000000dEaD"],
                  operator: "in",
                },
              ],
            },
          ],
        },
      });
      console.log("Created project policy:", projectPolicy.id);
  ```

  ```python Python lines wrap [expandable]
      import asyncio
      from cdp import CdpClient
      from dotenv import load_dotenv
      from cdp.policies.types import CreatePolicyOptions, EthValueCriterion, EvmAddressCriterion, SignEvmTransactionRule
      from cdp.update_account_types import UpdateAccountOptions

      load_dotenv()

      async def main():
          cdp = CdpClient()

          account = await cdp.evm.get_or_create_account(name="PolicyAccount")
          print(f"Account address: {account.address}")

          # Create policy
          policy = await cdp.policies.create_policy(
              policy=CreatePolicyOptions(
                  scope="account",
                  description="Account Allowlist Example",
                  rules=[
                      SignEvmTransactionRule(
                          action="accept",
                          criteria=[
                              EthValueCriterion(
                                  ethValue="1000000000000000000", # 1 ETH in wei
                                  operator="<=",
                              ),
                              EvmAddressCriterion(
                                  addresses=["0x000000000000000000000000000000000000dEaD"],
                                  operator="in",
                              ),
                          ],
                      )
                  ],
              )
          )
          print(f"Created policy: {policy.id}")

          # Apply policy to the account
          updated_account = await cdp.evm.update_account(
              address=account.address,
              update=UpdateAccountOptions(
                  account_policy=policy.id
              ),
          )
          print(f"Applied policy to account: {updated_account.address}")

          # Create another account with policy immediately applied to it
          other_account = await cdp.evm.create_account(
            name="OtherPolicyAccount",
            account_policy=policy.id,
          )
          print(f"Other account address: {other_account.address}");

          # Create project policy example
          project_policy = await cdp.policies.create_policy(
              policy=CreatePolicyOptions(
                  scope="project",
                  description="Project Transaction Limit Example",
                  rules=[
                      SignEvmTransactionRule(
                          action="accept",
                          criteria=[
                              EthValueCriterion(
                                  ethValue="5000000000000000000", # 5 ETH in wei
                                  operator="<=",
                              ),
                              EvmAddressCriterion(
                                  addresses=["0x000000000000000000000000000000000000dEaD"],
                                  operator="in",
                              ),
                          ],
                      )
                  ],
              )
          )
          print(f"Created project policy: {project_policy.id}")

          await cdp.close()


      asyncio.run(main())
  ```
</CodeGroup>

Continue reading to learn more on how to allowlist, denylist, or limit transactions.

## Example policies

### Allowlist

The following example demonstrates a policy that allows signing transactions only to specific EVM addresses. Transactions to any address outside of this list will automatically be deleted by the policy engine.

```json allow-list-policy.json lines wrap
{
  "description": "Allowlist policy example",
  "rules": [
    {
      "action": "accept",
      "criteria": [
        {
          "addresses": [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0x1111111111111111111111111111111111111111"
          ],
          "operator": "in",
          "type": "evmAddress"
        }
      ],
      "operation": "signEvmTransaction"
    }
  ],
  "scope": "project"
}
```

The above policy treats the set of `addresses` as an allowlist, only accepting sign transaction requests to an EVM address that is `in` the set.

### Denylist

The following example demonstrates a policy that rejects signing transactions to specific EVM addresses. Transactions with `to` field set to any address outside of this list will be accepted.

```json deny-list-policy.json lines wrap
{
  "description": "Denylist policy example",
  "rules": [
    {
      "action": "accept",
      "criteria": [
        {
          "addresses": [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0x1111111111111111111111111111111111111111"
          ],
          "operator": "not in",
          "type": "evmAddress"
        }
      ],
      "operation": "signEvmTransaction"
    }
  ],
  "scope": "project"
}
```

The above policy treats the set of `addresses` as a denylist, rejecting any sign transaction to an address that is `not in` the set.

### Transaction limits

The following example demonstrates a policy that only permits signing transactions with a value of 2000000000000000000 wei (2 ETH) or less.

```json transaction-limit-policy.json lines wrap
{
  "description": "Transaction limit policy",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "2000000000000000000",
          "operator": "<="
        }
      ]
    }
  ]
}
```

### Network restrictions

The following example demonstrates a policy that only permits sending transactions on the Base Sepolia network.

```json restricted-network-policy.json lines wrap
{
  "description": "Restricted network policy",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "sendEvmTransaction",
      "criteria": [
        {
          "type": "evmNetwork",
          "networks": ["base-sepolia"],
          "operator": "in"
        }
      ]
    }
  ]
}
```

### Multi-rule

Learn more on combining multiple rules in a single policy.

* [**Allowlist first**](#allowlist-first): A policy that checks the allowlist first, then the transaction limit.
* [**Allowlist second**](#allowlist-second): A policy that checks the transaction value first, then uses a combined rule to check both the transaction value and the allowlist.

#### Allowlist first

The following example demonstrates a policy that contains both an allowlist and a transaction limit.

```json combined-policy-1.json lines wrap
{
  "description": "Allowlist then value limit",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "evmAddress",
          "addresses": [
            "0xffffffffffffffffffffffffffffffffffffffff"
          ],
          "operator": "in"
        }
      ]
    },
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "2000000000000000000",
          "operator": "<="
        }
      ]
    }
  ]
}
```

In the example above, assume a user sends a sign transaction request with a value of 4000000000000000000 wei (4 ETH) to the address 0x123:

1. The transaction will be rejected against the first rule, as the address is not in the allowlist. However, the criteria still is not met and the engine will evaluate the transaction against the second rule.
2. The transaction will be rejected against the second rule, as the value is greater than 2000000000000000000 wei (2 ETH).

#### Allowlist second

Let's take a look at another combined policy example where we define the allowlist as the second rule instead of the first.

```json combined-policy-2.json lines wrap
{
  "description": "Value limit then allowlist",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "1000000000000000000",
          "operator": "<="
        }
      ]
    },
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "ethValue",
          "ethValue": "2000000000000000000",
          "operator": "<="
        },
        {
          "type": "evmAddress",
          "addresses": [
            "0xffffffffffffffffffffffffffffffffffffffff"
          ],
          "operator": "in"
        }
      ]
    }
  ]
}
```

In the above example, if a user sends a transaction with a value of 1500000000000000000 wei (1.5 ETH) to the address 0x123:

1. The transaction will be rejected against the first rule, as the value is greater than 1000000000000000000 wei. However, the criteria still is not met and the engine will continue evaluating the transaction against the second rule.
2. The transaction matches against the second rule, as the value is less than or equal to 2000000000000000000 wei **AND** the address is in the allowlist. The transaction will be accepted.

<Accordion title="What's the difference?">
  The primary differences between these two examples are the rule order in which a transaction is evaluated.

  * **The first example checks the allowlist first, and then the transaction limit**
    * This option is more restrictive, as it requires all transactions go to allowlisted addresses first, regardless of their value.

  * **The second example checks the transaction value first, then uses a combined rule to check both the transaction value and the allowlist**
    * This option offers more granular control by allowing small transactions to be signed to any address, but restricts larger transactions to allowlisted addresses only.
</Accordion>

### Message signing restrictions

The following example demonstrates how to guarantee any attempt to sign a message will conform to a specific template. When composing a regular expression in the `match` field, any valid [re2](https://github.com/google/re2) regular expression syntax will be accepted.

```json accept-sign-message-policy.json lines wrap
{
  "description": "Accept sign message policy",
  "scope": "project",
  "rules": [
    {
      "action": "accept",
      "operation": "signEvmMessage",
      "criteria": [
        {
          "type": "evmMessage",
          "match": "^I solemnly swear that I,(.*), am up to no good\.$"
        }
      ]
    }
  ]
}
```

### Limiting USDC Spend

This policy restricts USDC transactions on the Base network to transfers of 10,000 tokens or less. It applies to both signing and sending transactions to the USDC contract address, using the ERC20 ABI to validate that only `transfer` function calls with a `value` parameter under the specified limit are permitted.

```json limit-usdc-spend-policy.json
{
  "description": "Limit USDC Spend",
  "scope": "account",
  "rules": [
    {
      "action": "accept",
      "operation": "sendEvmTransaction",
      "criteria": [
        {
          "type": "evmNetwork",
          "networks": ["base"],
          "operator": "in"
        },
        {
          "type": "evmAddress",
          "addresses": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
          "operator": "in"
        },
        {
          "type": "evmData",
          "abi": "erc20",
          "conditions": [
            {
              "function": "transfer",
              "params": [
                {
                  "name": "value",
                  "operator": "<=",
                  "value": "10000"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "action": "accept",
      "operation": "signEvmTransaction",
      "criteria": [
        {
          "type": "evmAddress",
          "addresses": ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"],
          "operator": "in"
        },
        {
          "type": "evmData",
          "abi": "erc20",
          "conditions": [
            {
              "function": "transfer",
              "params": [
                {
                  "name": "value",
                  "operator": "<=",
                  "value": "10000"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Disable signing arbitrary hashes

The example below demonstrates a policy to prevent fraud by rejecting any attempt to sign a hash (i.e., undefined or arbitrary input data) on behalf of an account.

```json reject-sign-hash-policy.json lines wrap
{
  "description": "Reject sign hash policy",
  "scope": "project",
  "rules": [
    {
      "action": "reject",
      "operation": "signEvmHash"
    }
  ]
}
```

## Video: Watch and learn

Watch the video to learn how to implement and manage policies with CDP Wallet API, which covers:

* An overview of policy engine setup and configuration
* How to create project-level and account-level policies
* Best practices for implementing transaction controls and security measures

<Frame>
  <iframe width="560" height="315" src="https://www.youtube.com/embed/PBgWe345V0w" title="How to implement policies with CDP Wallet API" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen />
</Frame>

## What to read next

* [**v2 Wallet Security**](/wallet-api/v2/introduction/security): Learn more about the security features of the CDP v2 Wallet API.
* [**v2 API Reference**](/api-reference/v2/rest-api/policy-engine/policy-engine): Explore the API reference for CDP Policies.
