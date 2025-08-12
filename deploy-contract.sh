#!/bin/bash

echo "🚀 REITx Contract Deployment Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with WALLET_MNEMONIC and WALLET_VERSION"
    exit 1
fi

# Load environment variables
export $(cat .env | xargs)

# Check wallet balance
echo -e "${BLUE}📱 Checking wallet balance...${NC}"
BALANCE_OUTPUT=$(npx tsx scripts/checkWallet.ts 2>/dev/null | grep "Balance:" || echo "Balance: 0.0000 TON")
echo "$BALANCE_OUTPUT"

# Extract balance value
BALANCE=$(echo "$BALANCE_OUTPUT" | grep -oE '[0-9]+\.[0-9]+' | head -1)

# Check if balance is sufficient
if (( $(echo "$BALANCE < 0.5" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Insufficient balance for deployment!${NC}"
    echo ""
    echo "Your wallet address:"
    npx tsx scripts/checkWallet.ts 2>/dev/null | grep "Address:" || echo "Could not get address"
    echo ""
    echo -e "${YELLOW}Please get test TON from: https://t.me/testgiver_ton_bot${NC}"
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Sufficient balance detected!${NC}"
echo ""

# Deploy the contract
echo -e "${BLUE}🔨 Deploying REITx Factory contract...${NC}"
echo ""

# Run deployment with mnemonic
yarn blueprint run deployREITxFactory --testnet --mnemonic

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Copy the contract address from above"
    echo "2. Update your dapp configuration:"
    echo "   yarn ts-node scripts/updateContractAddress.ts YOUR_CONTRACT_ADDRESS"
    echo "3. Build and deploy your frontend:"
    echo "   cd src/dapp && yarn build"
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Please check the error messages above."
    exit 1
fi