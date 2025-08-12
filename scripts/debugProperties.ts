import { Address, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { REITxFactory } from '../wrappers/REITxFactory';

async function debugProperties() {
    console.log('🔍 Debugging Property Storage in Contract\n');

    // Initialize client
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });

    // Contract address from config
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    console.log('📋 Contract Address:', contractAddress);

    try {
        const address = Address.parse(contractAddress);
        const factory = REITxFactory.createFromAddress(address);
        const provider = client.provider(factory.address);

        // Check if contract is deployed
        const state = await client.getContractState(address);
        console.log('📊 Contract State:', state.state);

        if (state.state !== 'active') {
            console.log('❌ Contract is not active');
            return;
        }

        // Get next property ID (this tells us how many properties exist)
        console.log('\n🏢 Checking Properties:');
        try {
            const nextPropertyId = await factory.getNextPropertyId(provider as any);
            console.log('Next Property ID:', nextPropertyId);
            console.log('Total Properties:', nextPropertyId);

            if (nextPropertyId === 0) {
                console.log('⚠️  No properties have been created yet');
                console.log('\n💡 Possible reasons:');
                console.log('1. The create_property transaction failed');
                console.log('2. The transaction is still being processed');
                console.log('3. The property creation was not properly sent to the contract');
            } else {
                // Try to fetch properties
                console.log('\n📝 Fetching property details:');
                for (let i = 0; i < nextPropertyId; i++) {
                    try {
                        console.log(`\nProperty ${i}:`);
                        const propertyInfo = await factory.getPropertyInfo(provider as any, i);
                        console.log('  Name:', propertyInfo.name);
                        console.log('  Location:', propertyInfo.location);
                        console.log('  Total Supply:', propertyInfo.totalSupply.toString());
                        console.log('  Price per Token:', propertyInfo.pricePerToken.toString());
                        console.log('  Monthly Rent:', propertyInfo.monthlyRent.toString());
                        console.log('  Active:', propertyInfo.active);
                        console.log('  Available Tokens:', propertyInfo.availableTokens.toString());
                        console.log('  URI:', propertyInfo.uri);
                    } catch (err) {
                        console.log(`  ❌ Error fetching property ${i}:`, err);
                    }
                }
            }
        } catch (err) {
            console.log('❌ Error getting next property ID:', err);
            console.log('\n💡 This might mean:');
            console.log('1. The contract does not have the get_next_property_id method');
            console.log('2. The contract state is corrupted');
            console.log('3. There is an issue with the contract deployment');
        }

        // Try to check admin status
        console.log('\n👤 Checking Admin Status:');
        const adminWallet = Address.parse('0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b');
        try {
            const result = await provider.get('is_admin_address', [
                { type: 'slice', cell: beginCell().storeAddress(adminWallet).endCell() }
            ]);
            const isAdmin = result.stack.readNumber();
            console.log('Admin Status for wallet:', isAdmin);
            console.log('Status meaning:', isAdmin === 2 ? 'Super Admin' : isAdmin === 1 ? 'Regular Admin' : 'Not Admin');
        } catch (err) {
            console.log('❌ Error checking admin status:', err);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Add missing import
import { beginCell } from '@ton/core';

debugProperties().catch(console.error);