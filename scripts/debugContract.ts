import { Address, TonClient, Cell, beginCell } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { Buffer } from 'buffer';

async function debugContract() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const address = Address.parse(contractAddress);
    
    console.log('=== Contract Debug Info ===\n');
    
    // Get contract state
    const state = await client.getContractState(address);
    console.log('Contract state:', state.state);
    console.log('Balance:', state.balance / 1000000000n, 'TON');
    
    // Check code hash
    if (state.code) {
        const codeCell = Cell.fromBase64(state.code.toString('base64'));
        const codeHash = codeCell.hash().toString('hex');
        console.log('Code hash:', codeHash);
    }
    
    // Try to simulate a create_property transaction
    console.log('\n=== Simulating Create Property Message ===\n');
    
    const message = beginCell()
        .storeUint(0x12345678, 32) // op::create_property
        .storeUint(0, 64) // query_id
        .storeRef(beginCell().storeBuffer(Buffer.from('Test Property')).endCell())
        .storeRef(beginCell().storeBuffer(Buffer.from('Test Location')).endCell())
        .storeCoins(1000000000n) // 1 token supply
        .storeCoins(5000000n) // 0.005 TON per token
        .storeCoins(500000000n) // 0.5 TON monthly rent
        .storeRef(beginCell().storeBuffer(Buffer.from('https://test.uri')).endCell())
        .endCell();
    
    console.log('Message structure:');
    console.log('  Op code: 0x12345678 (create_property)');
    console.log('  Query ID: 0');
    console.log('  Property name: Test Property');
    console.log('  Location: Test Location');
    console.log('  Total supply: 1 token');
    console.log('  Price per token: 0.005 TON');
    console.log('  Monthly rent: 0.5 TON');
    console.log('  URI: https://test.uri');
    console.log('\nMessage BOC:', message.toBoc().toString('base64'));
    
    // Check admin
    console.log('\n=== Admin Check ===\n');
    try {
        const adminResult = await client.runMethod(address, 'get_admin_address', []);
        const adminCell = adminResult.stack.readCell();
        const adminSlice = adminCell.beginParse();
        const adminAddress = adminSlice.loadAddress();
        console.log('Contract admin:', adminAddress?.toString());
        
        // Compare with wallet
        const walletAddr = Address.parse('0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b');
        console.log('Your wallet:', walletAddr.toString());
        console.log('Match:', adminAddress?.equals(walletAddr) ? '✅ YES' : '❌ NO');
    } catch (err: any) {
        console.log('Error getting admin:', err.message);
    }
    
    // Try to check if contract is paused
    console.log('\n=== Contract Status ===\n');
    try {
        const pausedResult = await client.runMethod(address, 'is_paused', []);
        const isPaused = pausedResult.stack.readNumber();
        console.log('Is paused:', isPaused ? '❌ YES (transactions blocked)' : '✅ NO');
    } catch (err: any) {
        console.log('Error checking pause status:', err.message);
    }
    
    // Get next property ID
    try {
        const idResult = await client.runMethod(address, 'get_next_property_id', []);
        const nextId = idResult.stack.readNumber();
        console.log('Next property ID:', nextId);
        console.log('Properties created so far:', nextId);
    } catch (err: any) {
        console.log('Error getting next property ID:', err.message);
    }
}

debugContract().catch(console.error);