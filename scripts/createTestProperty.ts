import { toNano } from '@ton/core';
import { REITxFactory } from '../wrappers/REITxFactory';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    
    // Get contract address from user or use default
    const contractAddress = args.length > 0 ? args[0] : await ui.input('REITx Factory contract address');
    
    if (!contractAddress) {
        throw new Error('Contract address is required');
    }

    console.log('📍 Using REITx Factory at:', contractAddress);
    
    const reitxFactory = provider.open(REITxFactory.createFromAddress(
        provider.api().utils.parseAddress(contractAddress)
    ));

    // Check if contract is deployed
    const isDeployed = await provider.isContractDeployed(reitxFactory.address);
    if (!isDeployed) {
        throw new Error('Contract not deployed at the provided address');
    }

    console.log('✅ Contract verified as deployed');

    // Create a test property
    console.log('🏠 Creating test property...');
    
    await reitxFactory.sendCreateProperty(provider.sender(), {
        name: "Four Seasons Resort",
        location: "Bahia, Brazil", 
        totalSupply: toNano('1000'), // 1000 tokens
        pricePerToken: toNano('0.1'), // 0.1 TON per token
        monthlyRent: toNano('5'), // 5 TON monthly rent
        uri: "https://example.com/property/1",
        queryId: Date.now()
    });

    console.log('✅ Test property creation transaction sent!');
    console.log('🔍 You can verify on: https://testnet.tonscan.org/address/' + reitxFactory.address.toString());
}