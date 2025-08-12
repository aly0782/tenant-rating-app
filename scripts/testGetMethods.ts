import { Address, TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

async function testGetMethods() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const address = Address.parse(contractAddress);
    
    console.log('Testing contract at:', contractAddress);
    
    try {
        // Test get_next_property_id
        console.log('\n1. Testing get_next_property_id:');
        try {
            const result = await client.runMethod(address, 'get_next_property_id', []);
            console.log('✅ Result:', result.stack);
            console.log('Next property ID:', result.stack.readNumber());
        } catch (err: any) {
            console.log('❌ Error:', err.message);
        }
        
        // Test is_paused
        console.log('\n2. Testing is_paused:');
        try {
            const result = await client.runMethod(address, 'is_paused', []);
            console.log('✅ Result:', result.stack);
            console.log('Is paused:', result.stack.readNumber());
        } catch (err: any) {
            console.log('❌ Error:', err.message);
        }
        
        // Test get_admin_address
        console.log('\n3. Testing get_admin_address:');
        try {
            const result = await client.runMethod(address, 'get_admin_address', []);
            console.log('✅ Result:', result.stack);
            const adminSlice = result.stack.readCell().beginParse();
            const adminAddress = adminSlice.loadAddress();
            console.log('Admin address:', adminAddress?.toString());
        } catch (err: any) {
            console.log('❌ Error:', err.message);
        }
        
        // Test get_property_info for property 0
        console.log('\n4. Testing get_property_info(0):');
        try {
            const result = await client.runMethod(address, 'get_property_info', [
                { type: 'int', value: 0n }
            ]);
            console.log('✅ Property found');
            console.log('Stack items:', result.stack);
        } catch (err: any) {
            console.log('❌ Error:', err.message);
        }
        
    } catch (error) {
        console.error('General error:', error);
    }
}

testGetMethods().catch(console.error);