# REITx Factory Contract Deployment Guide

## Prerequisites

1. **Install TON Wallet**: Download Tonkeeper or another TON Connect compatible wallet
2. **Switch to Testnet**: In your wallet settings, switch to TON testnet
3. **Get Test TON**: Visit https://t.me/testgiver_ton_bot to get test tokens (~5 TON should be enough)

## Deployment Steps

### Step 1: Deploy the Contract

```bash
yarn blueprint run deployREITxFactory --testnet
```

When prompted:
1. Select "TON Connect compatible mobile wallet (example: Tonkeeper)"
2. Scan the QR code with your wallet
3. Confirm the deployment transaction (~0.5 TON)

The script will output the deployed contract address. **Save this address!**

### Step 2: Update Dapp Configuration

Update the contract address in your dapp configuration:

1. Open `src/dapp/src/hooks/useREITxFactory.ts`
2. Replace the placeholder address with your deployed contract address:

```typescript
// Replace this line:
const address = factoryAddress || 'EQDREITxContractAddressPlaceholder';

// With your actual deployed address:
const address = factoryAddress || 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### Step 3: Create Test Properties

After deployment, create some test properties:

```bash
yarn blueprint run createTestProperty --testnet YOUR_CONTRACT_ADDRESS
```

This will create a test property you can use for testing your dapp.

## Alternative: Use Existing Deployed Contract

If you don't want to deploy your own contract, you can use a pre-deployed test contract:

**Testnet Contract Address**: `EQCYour-Test-Contract-Address-Here`

Simply update your dapp configuration with this address.

## Verification

After deployment, you can verify your contract on the TON testnet explorer:
`https://testnet.tonscan.org/address/YOUR_CONTRACT_ADDRESS`

## Troubleshooting

### Contract Build Issues
If the contract fails to compile, ensure all dependencies are installed:
```bash
yarn install
```

### Deployment Fails
- Ensure you have enough test TON (at least 1 TON)
- Check that you're connected to testnet, not mainnet
- Try refreshing the connection in your wallet

### Transaction Not Found
- Testnet can be slower than mainnet
- Wait a few minutes and check the explorer again
- The transaction might still be pending

## Next Steps

Once deployed:
1. Test basic functionality (create property, buy tokens)
2. Add more test properties for a complete demo
3. Update your frontend to point to the deployed contract