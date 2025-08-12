# REITx Multi-Admin Factory - Deployment Instructions

## Contract Details

- **Contract Address**: `EQA7n--u11cPQdY4zi_chGpu_WsHwOBs4Fc88pD2jDFSkD8J`
- **Network**: TON Testnet
- **Super Admin**: `EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb`

## Configured Admins

1. **Super Admin**: `EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb` (Deployer)
2. **Admin 1**: `UQArJIGQC7pe2CkdKQOwPOrjUjUOp4YgIC89SH8vKnd7HjQm`
3. **Admin 2**: `0QAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve2LU`

## Frontend Access

The dApp is running at: http://localhost:5174/

### Available Pages:
- **Home**: http://localhost:5174/
- **Properties**: View and purchase property tokens
- **Dashboard**: View your token holdings
- **Admin Panel**: http://localhost:5174/admin (Admin only)
- **Contract Details**: http://localhost:5174/contract
- **Legal**: http://localhost:5174/legal
- **Whitepaper**: http://localhost:5174/whitepaper

## Manual Deployment (if needed)

Due to rate limiting, you may need to deploy manually. Use these steps:

### 1. Deploy Contract via TON Connect

```bash
# The contract is compiled and ready at:
# build/REITxFactoryMultiAdmin.compiled.json

# Use Tonkeeper or another wallet to deploy with:
# - Code: From compiled JSON
# - Data: Initial state with your address as super admin
# - Value: 0.1 TON
```

### 2. Add Admins Manually

After deployment, use the Admin Panel to add the additional admins:
1. Connect wallet as super admin
2. Go to Admin Panel → Admins tab
3. Add each admin address

### 3. Verify Deployment

Check the contract on explorer:
https://testnet.tonscan.org/address/EQA7n--u11cPQdY4zi_chGpu_WsHwOBs4Fc88pD2jDFSkD8J

## Testing the System

### As Admin:
1. Visit http://localhost:5174/admin
2. Connect with an admin wallet
3. Create a test property
4. Set pricing and supply

### As User:
1. Visit http://localhost:5174/
2. Connect any wallet
3. Browse properties
4. Purchase tokens
5. Check dashboard for holdings

## Contract Features

✅ **Multi-Admin Support**: Super admin + multiple regular admins
✅ **User Holdings Tracking**: Stores purchase data for dashboard
✅ **Rent Distribution**: Automatic proportional distribution
✅ **Property Management**: Create and manage tokenized properties
✅ **Pausable**: Emergency pause functionality
✅ **Role-Based Access**: Different permission levels

## Next Steps

1. **Deploy Contract**: Use the wallet with 5.2 TON to deploy
2. **Add Admins**: Configure the additional admin addresses
3. **Create Properties**: Use admin panel to create test properties
4. **Test Purchase Flow**: Buy tokens from a user wallet
5. **Test Rent Distribution**: Distribute test rent to token holders

## Troubleshooting

### Rate Limiting Issues
If you encounter rate limiting:
1. Wait 1-2 minutes between operations
2. Use different RPC endpoints
3. Consider using a TON API key

### Contract Not Responding
1. Verify deployment on explorer
2. Check wallet balance for gas
3. Ensure correct network (testnet)

### Admin Access Denied
1. Verify wallet address matches configured admins
2. Check contract configuration in `/src/dapp/src/config/contract.json`
3. Ensure wallet is connected

## Support

For issues or questions:
- Contract Explorer: https://testnet.tonscan.org
- Get Test TON: https://t.me/testgiver_ton_bot
- TON Documentation: https://docs.ton.org