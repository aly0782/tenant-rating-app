#!/bin/bash

# REITx Production Deployment Script for reitx.xyz
# This script deploys the contract and prepares the frontend for production

set -e

echo "🚀 Starting REITx deployment for reitx.xyz..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if user has wallet setup
print_status "Checking deployment prerequisites..."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed. Please install yarn first."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
yarn install

# Check if user wants to deploy contract
read -p "Do you want to deploy the REITx Factory contract to TON testnet? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting contract deployment..."
    print_warning "Make sure you have:"
    print_warning "1. Tonkeeper wallet installed"
    print_warning "2. Switched to TON testnet"
    print_warning "3. At least 1 TON in testnet tokens"
    
    read -p "Press Enter to continue with deployment..."
    
    # Deploy contract
    yarn blueprint run deployREITxFactory --testnet
    
    print_success "Contract deployment initiated!"
    print_warning "Please save the contract address that was displayed above."
    
    # Ask for contract address
    read -p "Enter the deployed contract address: " CONTRACT_ADDRESS
    
    if [ -n "$CONTRACT_ADDRESS" ]; then
        print_status "Updating configuration with contract address: $CONTRACT_ADDRESS"
        
        # Update the contract address in the configuration
        yarn ts-node scripts/updateContractAddress.ts "$CONTRACT_ADDRESS"
        
        print_success "Contract address updated in configuration!"
    else
        print_warning "No contract address provided. You'll need to update it manually later."
    fi
else
    print_warning "Skipping contract deployment. Using existing configuration."
fi

# Build the frontend
print_status "Building frontend for production..."
cd src/dapp

# Install dapp dependencies
yarn install

# Build the project
yarn build

print_success "Frontend build complete!"

cd ../..

# Display deployment information
echo ""
print_success "🎉 REITx deployment preparation complete!"
echo ""
print_status "📋 Next steps:"
echo "   1. Deploy the built frontend from 'src/dapp/dist/' to your hosting provider"
echo "   2. Configure your DNS to point reitx.xyz to your hosting provider"
echo "   3. Ensure SSL certificate is active"
echo "   4. Test the deployment thoroughly"
echo ""
print_status "🔗 Important URLs:"
echo "   • Frontend build: ./src/dapp/dist/"
echo "   • TON Connect manifest: https://reitx.xyz/tonconnect-manifest.json"
echo "   • Deployment guide: ./PRODUCTION_DEPLOYMENT.md"
echo ""

if [ -n "$CONTRACT_ADDRESS" ]; then
    print_status "📄 Contract Information:"
    echo "   • Contract Address: $CONTRACT_ADDRESS"
    echo "   • Network: TON Testnet"
    echo "   • Explorer: https://testnet.tonscan.org/address/$CONTRACT_ADDRESS"
    echo ""
fi

print_status "🧪 Testing checklist:"
echo "   □ Website loads at https://reitx.xyz"
echo "   □ TON Connect wallet connection works"
echo "   □ Contract interaction functions properly"
echo "   □ Mobile responsiveness"
echo ""

print_success "Deployment preparation completed successfully! 🚀"