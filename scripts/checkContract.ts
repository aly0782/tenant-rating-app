import { Address, TonClient } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

async function checkContract() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const address = Address.parse(contractAddress);
    
    try {
        const state = await client.getContractState(address);
        console.log('Contract state:', state);
        
        if (state.state === 'active') {
            console.log('✅ Contract is deployed and active');
            
            // Try to get contract data
            const result = await client.runMethod(address, 'get_admin_status', []);
            console.log('Admin status result:', result);
        } else {
            console.log('❌ Contract is not active. State:', state.state);
        }
    } catch (error) {
        console.error('Error checking contract:', error);
    }
}

checkContract().catch(console.error);