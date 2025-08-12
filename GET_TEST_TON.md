# 🚀 Getting Test TON for Deployment

## Your Wallet Address:
```
EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb
```

## Steps to Get Test TON:

### Option 1: Telegram Bot (Easiest)
1. Open Telegram
2. Go to: [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)
3. Send this address: `EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb`
4. You'll receive 2-5 test TON

### Option 2: Testnet Faucet Website
1. Visit: https://faucet.tonscan.io/
2. Enter address: `EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb`
3. Complete captcha
4. Receive test TON

### Option 3: From Your Tonkeeper
If you already have test TON in Tonkeeper:
1. Open Tonkeeper
2. Make sure you're on **Testnet** (Settings → Network)
3. Send TON to: `EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb`

## Check Balance:
```bash
npx tsx scripts/checkWallet.ts
```

## Once You Have Test TON:

Run the deployment selecting "Mnemonic" option:
```bash
yarn blueprint run deployREITxFactory --testnet
```

Then select option 4: **Mnemonic**