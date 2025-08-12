# REITx Production Deployment Guide for reitx.xyz

## 🚀 Quick Deployment Steps

### Step 1: Deploy Contract to TON Testnet

1. **Prepare your wallet:**
   - Install Tonkeeper wallet
   - Switch to TON testnet 
   - Get test TON from: https://t.me/testgiver_ton_bot

2. **Deploy the contract:**
   ```bash
   yarn blueprint run deployREITxFactory --testnet
   ```
   
3. **Follow the prompts:**
   - Select "TON Connect compatible mobile wallet"
   - Scan QR code with Tonkeeper
   - Confirm deployment transaction

4. **Save the contract address** that will be displayed after successful deployment

### Step 2: Update Production Configuration

Once you have the deployed contract address, update:

```bash
# In src/dapp/src/hooks/useREITxFactory.ts, replace line 33:
const address = factoryAddress || 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### Step 3: Create Test Properties

```bash
yarn blueprint run createTestProperty --testnet YOUR_CONTRACT_ADDRESS
```

### Step 4: Build and Deploy Frontend

```bash
cd src/dapp
yarn install
yarn build
```

The build output will be in `src/dapp/dist/` - deploy this to your reitx.xyz hosting.

## 🔧 Environment Configuration

Your environment is already configured for reitx.xyz:

- ✅ Domain: `https://reitx.xyz`
- ✅ TON Connect Manifest: Updated
- ✅ Network: TON Testnet
- ✅ Build scripts: Ready

## 🏗️ Infrastructure Setup

### Vercel Deployment (Recommended)

1. Connect your GitHub repo to Vercel
2. Set build settings:
   - Build Command: `yarn vercel-build`
   - Output Directory: `src/dapp/dist`
   - Root Directory: `/`

3. Environment Variables:
   ```
   VITE_PUBLIC_URL=https://reitx.xyz
   VITE_REACT_APP_TITLE=REITx
   VITE_TON_NETWORK=testnet
   ```

### Custom Domain Setup

1. Add `reitx.xyz` to your hosting provider
2. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: your-hosting-provider
   ```

## 🧪 Testing Checklist

After deployment, verify:

- [ ] Website loads at https://reitx.xyz
- [ ] TON Connect wallet connection works
- [ ] Contract interaction functions properly
- [ ] Test property creation/purchase flows
- [ ] Mobile responsiveness

## 📋 Production Checklist

Before going live:

- [ ] Contract deployed to testnet (for testing)
- [ ] Frontend deployed to reitx.xyz
- [ ] TON Connect manifest accessible
- [ ] SSL certificate active
- [ ] Error handling tested
- [ ] Mobile wallet integration tested

## 🔄 Mainnet Migration

When ready for production:

1. Deploy contract to TON mainnet
2. Update contract address in dapp
3. Update environment to `mainnet`
4. Test thoroughly before announcing

## 📞 Support

- TON testnet explorer: https://testnet.tonscan.org
- Blueprint docs: https://docs.ton.org/develop/dapps/apis/blueprint
- TON Connect docs: https://docs.ton.org/develop/dapps/ton-connect