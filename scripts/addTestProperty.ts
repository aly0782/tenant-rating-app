import { toNano, Address } from '@ton/core';
import { REITxFactory } from '../wrappers/REITxFactory';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    
    // The deployed contract address
    const contractAddress = 'EQB-OAFqUknskjjg0sTw7Jb8ubjxipwsLZBPiUxkHzEY1LPL';
    
    console.log('📍 Using REITx Factory at:', contractAddress);
    
    const reitxFactory = provider.open(
        REITxFactory.createFromAddress(Address.parse(contractAddress))
    );

    // Check if contract is deployed
    const isDeployed = await provider.isContractDeployed(reitxFactory.address);
    if (!isDeployed) {
        throw new Error('Contract not deployed at the provided address');
    }

    console.log('✅ Contract verified as deployed');
    console.log('🏠 Creating test property with 1M tokens at 0.005 TON each...');
    
    try {
        await reitxFactory.sendCreateProperty(provider.sender(), {
            name: "Test Property - 1M Tokens",
            location: "Testnet Location", 
            totalSupply: toNano('1000000'), // 1,000,000 tokens
            pricePerToken: toNano('0.005'), // 0.005 TON per token
            monthlyRent: toNano('50'), // 50 TON monthly rent (for testing)
            uri: "https://reitx.xyz/property/test",
            queryId: Date.now()
        });

        console.log('✅ Test property creation transaction sent!');
        console.log('📊 Property Details:');
        console.log('   - Total Supply: 1,000,000 tokens');
        console.log('   - Price per Token: 0.005 TON');
        console.log('   - Total Value: 5,000 TON');
        console.log('   - Monthly Rent: 50 TON');
        console.log('');
        console.log('🔍 Verify on explorer:');
        console.log('   https://testnet.tonscan.org/address/' + reitxFactory.address.toString());
    } catch (error) {
        console.error('❌ Failed to create property:', error);
        console.log('');
        console.log('Note: Only the admin address can create properties.');
        console.log('Make sure you are using the same wallet that deployed the contract.');
    }
}