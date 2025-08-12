import { Address, TonClient, Cell } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';

async function checkContractData() {
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const address = Address.parse(contractAddress);
    
    console.log('=== Contract Data Analysis ===\n');
    
    // Get contract state
    const state = await client.getContractState(address);
    
    if (state.data) {
        console.log('Contract has data');
        const dataCell = Cell.fromBase64(state.data.toString('base64'));
        console.log('Data cell:', dataCell.toString());
        
        // Try to parse the data
        const slice = dataCell.beginParse();
        
        // Try to load admin address (first field in both contract versions)
        try {
            const adminAddress = slice.loadAddress();
            console.log('Admin address from data:', adminAddress?.toString());
        } catch (err) {
            console.log('Failed to parse admin address');
        }
        
        // Check remaining bits
        console.log('Remaining bits:', slice.remainingBits);
        console.log('Remaining refs:', slice.remainingRefs);
    } else {
        console.log('Contract has no data (uninitialized)');
    }
    
    // Try different get methods to understand contract version
    console.log('\n=== Testing Get Methods ===\n');
    
    const methods = [
        'get_next_property_id',
        'get_admin_address', 
        'is_paused',
        'get_total_funds_raised',
        'get_total_rent_distributed',
        'get_admin_status'
    ];
    
    for (const method of methods) {
        try {
            await client.runMethod(address, method, []);
            console.log(`✅ ${method} exists`);
        } catch (err: any) {
            if (err.message.includes('exit_code: 11')) {
                console.log(`❌ ${method} does not exist`);
            } else {
                console.log(`⚠️ ${method} failed with: ${err.message.split('\n')[0]}`);
            }
        }
    }
    
    // Check if this is the multi-admin contract
    console.log('\n=== Contract Type Detection ===\n');
    
    const hasMultiAdmin = await checkMethod(client, address, 'get_admin_status');
    const hasTotalFunds = await checkMethod(client, address, 'get_total_funds_raised');
    
    if (hasMultiAdmin && hasTotalFunds) {
        console.log('✅ This appears to be the Multi-Admin contract');
    } else if (!hasMultiAdmin && !hasTotalFunds) {
        console.log('⚠️ This appears to be the basic REITxFactory contract');
    } else {
        console.log('❓ Unknown contract type');
    }
}

async function checkMethod(client: TonClient, address: Address, method: string): Promise<boolean> {
    try {
        await client.runMethod(address, method, []);
        return true;
    } catch {
        return false;
    }
}

checkContractData().catch(console.error);