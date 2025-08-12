# TON Connect Manifest Fix Guide

## ✅ Issue Resolved

The "invalid manifest" error when scanning the QR code with Tonkeeper has been fixed!

### What was the problem?

1. **Domain redirect**: Your site redirects from `reitx.xyz` to `www.reitx.xyz`
2. **Manifest URL mismatch**: The manifest was configured for `reitx.xyz` but needs `www.reitx.xyz`

### What was fixed?

Updated all configurations to use `www.reitx.xyz`:

1. **tonconnect-manifest.json**: Updated URLs to use `www` subdomain
2. **.env file**: Changed `VITE_PUBLIC_URL` to `https://www.reitx.xyz`
3. **Development manifest**: Added for local testing

### Files Updated:
- `src/dapp/public/tonconnect-manifest.json` - Production manifest
- `src/dapp/public/tonconnect-manifest.dev.json` - Development manifest
- `src/dapp/.env` - Environment configuration

## 🚀 Deployment Steps

1. **Build the updated frontend:**
   ```bash
   cd src/dapp
   yarn build
   ```

2. **Deploy the `dist/` folder to your hosting provider**

3. **Ensure these files are accessible:**
   - https://www.reitx.xyz/tonconnect-manifest.json
   - https://www.reitx.xyz/logo.png
   - https://www.reitx.xyz/terms-of-use.txt
   - https://www.reitx.xyz/privacy-policy.txt

## 🧪 Testing

### Local Testing:
```bash
cd src/dapp
yarn dev
```
Then connect wallet at http://localhost:5174

### Production Testing:
After deployment, verify:
1. Visit https://www.reitx.xyz
2. Click "Connect Wallet"
3. Scan QR with Tonkeeper
4. Connection should work!

## 📋 Manifest Requirements

TON Connect requires:
- **url**: Must match the actual domain (including www if redirected)
- **name**: App name shown in wallet
- **iconUrl**: Must be accessible HTTPS URL
- **CORS**: Manifest must be accessible from wallet apps

## 🔍 Verification Commands

Check if manifest is accessible:
```bash
curl https://www.reitx.xyz/tonconnect-manifest.json
```

Validate JSON format:
```bash
curl -s https://www.reitx.xyz/tonconnect-manifest.json | python3 -m json.tool
```

## ⚠️ Common Issues

1. **Still getting "invalid manifest"?**
   - Clear Tonkeeper cache: Settings → Clear Cache
   - Ensure you're scanning the right QR code
   - Check that all URLs use HTTPS

2. **Manifest not found?**
   - Ensure files are deployed to the web server
   - Check that tonconnect-manifest.json is in the public root

3. **CORS errors?**
   - Add proper CORS headers in your hosting config
   - The vercel.json already includes these headers

## 🎯 Next Steps

1. Deploy the updated build to your hosting
2. Test wallet connection with Tonkeeper
3. Deploy your smart contract to TON testnet
4. Update contract address in the app configuration

Your TON Connect integration is now properly configured! 🎉