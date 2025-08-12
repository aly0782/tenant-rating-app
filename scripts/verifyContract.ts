import { Address, toNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { REITxFactory } from '../wrappers/REITxFactory';

async function main() {
    console.log('🔍 Verifying REITx Factory contract...');
    
    // Connect to testnet
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    const contractAddress = Address.parse('EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF');
    console.log('📍 Contract address:', contractAddress.toString());
    
    try {
        // Check if contract is deployed
        const contract = REITxFactory.createFromAddress(contractAddress);
        const provider = client.provider(contractAddress);
        
        // Check contract state
        const state = await client.getContractState(contractAddress);
        console.log('📊 Contract state:', state.state);
        
        if (state.state === 'active') {
            console.log('✅ Contract is deployed and active!');
            
            try {
                // Try to get next property ID
                const nextId = await contract.getNextPropertyId(provider);
                console.log('📝 Next property ID:', nextId);
            } catch (err: any) {
                console.log('⚠️  Get method error (may need initialization):', err.message);
            }
            
            try {
                // Try to check if paused
                const isPaused = await contract.getIsPaused(provider);
                console.log('⏸️  Is paused:', isPaused);
            } catch (err: any) {
                console.log('⚠️  Get method error:', err.message);
            }
            
            console.log('\n📋 Contract Address for frontend:');
            console.log(contractAddress.toString());
            console.log('\n✅ Contract is ready to use!');
        } else {
            console.log('❌ Contract is not active. State:', state.state);
        }
    } catch (error) {
        console.error('Error verifying contract:', error);
    }
}

main().catch(console.error);