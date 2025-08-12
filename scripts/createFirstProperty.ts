import { Address, beginCell, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { REITxFactory } from '../wrappers/REITxFactory';

export async function run(provider: NetworkProvider) {
    console.log('🏠 Creating first test property...');
    
    const contractAddress = Address.parse('EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF');
    const factory = REITxFactory.createFromAddress(contractAddress);
    const contract = provider.open(factory);
    
    console.log('📍 Contract address:', contractAddress.toString());
    console.log('👤 Admin address:', provider.sender().address?.toString());
    
    // Create property data
    const propertyData = {
        name: 'Luxury Patuá Apartment',
        location: 'Patuá, Lisbon, Portugal',
        totalSupply: toNano('1000000'), // 1M tokens
        pricePerToken: toNano('0.005'), // 0.005 TON per token
        monthlyRent: toNano('50'), // 50 TON monthly rent
        uri: 'https://gateway.pinata.cloud/ipfs/QmTestPropertyMetadata',
        queryId: Date.now()
    };
    
    console.log('📝 Creating property with data:');
    console.log('   Name:', propertyData.name);
    console.log('   Location:', propertyData.location);
    console.log('   Total Supply:', propertyData.totalSupply.toString(), 'nanotons');
    console.log('   Price per Token:', propertyData.pricePerToken.toString(), 'nanotons');
    console.log('   Monthly Rent:', propertyData.monthlyRent.toString(), 'nanotons');
    
    try {
        await contract.sendCreateProperty(
            provider.sender(),
            propertyData
        );
        
        console.log('✅ Property creation transaction sent!');
        console.log('⏳ Waiting for confirmation...');
        
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if property was created
        try {
            const nextId = await contract.getNextPropertyId();
            console.log('📊 Next property ID is now:', nextId);
            
            if (nextId > 0) {
                console.log('✅ Property successfully created!');
                
                // Try to get the property info
                const propertyInfo = await contract.getPropertyInfo(0);
                console.log('🏠 Property 0 info:', propertyInfo);
            }
        } catch (err) {
            console.log('⚠️  Could not verify property creation yet (may need more time)');
        }
        
    } catch (error) {
        console.error('❌ Error creating property:', error);
    }
}