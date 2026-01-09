# Fund Accounts

## Overview

With the CDP SDK, you can fund your account from fiat currency (eg. USD) in a bank account with a single API call. This method is currently limited to US-based individuals using US debit card (without 3DS verification) payment methods configured in a Coinbase account.
We will add support for businesses and for additional payment methods soon. This method currently supports funding accounts with USDC and ETH on the Base and Ethereum networks. Want more? [Get in touch](https://calendar.app.google/X6VRM3qwcSbUDQ1f8) for early access!

<Tip>
  Start by [creating a Coinbase account](https://login.coinbase.com/pick-your-account) if you don't already have one, and add payment method(s).
</Tip>

## Account Funding API (Beta)

To use the Account Funding API, you need a Coinbase account with a US debit card (non-3DS) payment method added. If you have multiple debit cards set up, this method will use the first non-3DS, active, verified card you added.

The Account Funding API supports both EOA accounts and Smart Accounts.

### Limits

Account funding limits are the same as your [Coinbase account limits](https://help.coinbase.com/en/coinbase/trading-and-funding/buying-selling-or-converting-crypto/limits-and-account-levels).

### Get a quote

Use the `quoteFund` method to generate quotes for converting between fiat currency and crypto tokens with all associated fees. The `quoteFund` method returns a quote object, which expires in 10 minutes, with estimated network and exchange fees associated with your account funding operation. Save on fees with [Coinbase One](https://www.coinbase.com/one).

<CodeGroup>
  ```ts TypeScript lines wrap 
      const account = await cdp.evm.getOrCreateAccount({ name: "account" });

      const quote = await account.quoteFund({
        network: "base",
        token: "eth",
        amount: 500000000000000n, // 0.0005 eth
      });

      // Parameters of the quote you can inspect to see if you want to execute it.
      console.log("Fiat amount: ", quote.fiatAmount)
      console.log("Fiat currency: ", quote.fiatCurrency)
      for (const fee of quote.fees) {
        console.log("Fee type: ", fee.type) // network_fee or exchange_fee
        console.log("Fee amount: ", fee.amount)
        console.log("Fee currency: ", fee.currency)
      }
  ```

  ```python Python lines wrap 
      account = await cdp.evm.get_or_create_account(name="account")

      quote = await account.quote_fund(
          network="base",
          token="eth",
          amount=500000000000000, # 0.0005 eth
      )
      # Parameters of the quote you can inspect to see if you want to execute it.
      print("Fiat amount: ", quote.fiat_amount)
      print("Fiat currency: ", quote.fiat_currency)
      for fee in quote.fees:
          print("Fee type: ", fee.type)  # network_fee or exchange_fee
          print("Fee amount: ", fee.amount)
          print("Fee currency: ", fee.currency)
  ```
</CodeGroup>

### Execute a quote

If you have already generated a quote, you can simply execute it to initiate account funding:

<CodeGroup>
  ```ts TypeScript lines wrap
      // Execute the previously quoted account funding operation
      const fundOperationResult = await quote.execute();

      // Wait for the funding operation to settle
      const completedTransfer = await account.waitForFundOperationReceipt({
          transferId: fundOperationResult.id
      });
  ```

  ```python Python lines wrap
      # Execute the previously quoted account funding operation
      fund_operation_result = await quote.execute()

      # Wait for the funding operation to settle
      completed_transfer = await account.wait_for_fund_operation_receipt(
          transfer_id=fund_operation_result.id,
      )  
  ```
</CodeGroup>

### Executing directly without a quote

**If you want to directly execute an account funding operation without first getting a quote**, you may directly call the fund method specifying the amount and crypto asset.

<CodeGroup>
  ```ts TypeScript lines wrap
      // Initiate the funding operation
      const fundOperation = await account.fund({
        network: "base",
        token: "eth",
        amount: 500000000000000n, // 0.0005 eth
      });

      // Wait for the funding operation to settle
      const completedTransfer = await account.waitForFundOperationReceipt({
        transferId: fundOperation.id,
      });
  ```

  ```python Python lines wrap
      # Initiate the funding operation
      fund_operation = await account.fund(
          network="base",
          token="eth",
          amount=500000000000000, # 0.0005 eth
      )

      # Wait for the funding operation to settle
      completed_transfer = await account.wait_for_fund_operation_receipt(
          transfer_id=fund_operation.id,
      )
  ```
</CodeGroup>
