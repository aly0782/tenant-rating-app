import { Address, TonClient, beginCell, toNano } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { Buffer } from 'buffer';

async function testSimpleTransaction() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const address = Address.parse(contractAddress);
    
    console.log('=== Testing Simple Transaction ===\n');
    
    // Get admin address from contract
    const adminResult = await client.runMethod(address, 'get_admin_address', []);
    const adminCell = adminResult.stack.readCell();
    const adminSlice = adminCell.beginParse();
    const adminAddress = adminSlice.loadAddress();
    
    console.log('Contract admin address:', adminAddress?.toString());
    console.log('Contract admin raw:', adminAddress?.toRawString());
    
    // Your wallet addresses in different formats
    const walletAddresses = [
        '0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b',
        'EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb',
    ];
    
    console.log('\nChecking wallet address formats:');
    for (const addr of walletAddresses) {
        const parsed = Address.parse(addr);
        console.log(`\nFormat: ${addr}`);
        console.log('  Parsed:', parsed.toString());
        console.log('  Raw:', parsed.toRawString());
        console.log('  Matches admin:', adminAddress?.equals(parsed) ? '✅' : '❌');
    }
    
    // Create a minimal test message
    const testMessage = beginCell()
        .storeUint(0x12345678, 32) // op::create_property
        .storeUint(123456, 64) // query_id
        .storeRef(beginCell().storeBuffer(Buffer.from('Test')).endCell())
        .storeRef(beginCell().storeBuffer(Buffer.from('Test')).endCell())
        .storeCoins(toNano('1')) // 1 TON total supply
        .storeCoins(toNano('0.001')) // 0.001 TON per token
        .storeCoins(toNano('0.1')) // 0.1 TON monthly rent
        .storeRef(beginCell().storeBuffer(Buffer.from('test')).endCell())
        .endCell();
    
    console.log('\n=== Test Message ===');
    console.log('Message BOC:', testMessage.toBoc().toString('base64'));
    console.log('Message size:', testMessage.toBoc().length, 'bytes');
    
    // Check contract balance
    const state = await client.getContractState(address);
    console.log('\n=== Contract State ===');
    console.log('Balance:', state.balance / 1000000000n, 'TON');
    console.log('State:', state.state);
    
    // Check if paused
    const pausedResult = await client.runMethod(address, 'is_paused', []);
    const isPaused = pausedResult.stack.readNumber();
    console.log('Is paused:', isPaused ? 'YES' : 'NO');
    
    // Get current property count
    const idResult = await client.runMethod(address, 'get_next_property_id', []);
    const nextId = idResult.stack.readNumber();
    console.log('Current properties:', nextId);
}

testSimpleTransaction().catch(console.error);