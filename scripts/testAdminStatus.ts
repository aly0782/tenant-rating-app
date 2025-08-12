import { Address, TonClient, beginCell } from '@ton/ton';
import { REITxFactory } from '../wrappers/REITxFactory';
const contractConfig = require('../src/dapp/src/config/contract.json');

async function testAdminStatus() {
    console.log('Testing admin status...\n');
    
    // Initialize TON client
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    try {
        // Parse contract address
        const factoryAddress = Address.parse(contractConfig.factoryAddress);
        console.log('Factory address:', factoryAddress.toString());
        
        // Create factory instance
        const factory = REITxFactory.createFromAddress(factoryAddress);
        const provider = client.provider(factoryAddress);
        
        // Test addresses
        const testAddresses = [
            contractConfig.superAdmin,
            ...contractConfig.admins
        ];
        
        console.log('\nChecking admin status for configured addresses:\n');
        
        for (const addr of testAddresses) {
            try {
                const parsed = Address.parse(addr);
                console.log(`\nAddress: ${addr}`);
                console.log(`  Parsed: ${parsed.toString()}`);
                console.log(`  Raw: ${parsed.toRawString()}`);
                
                // Check admin status from contract
                const adminStatus = await factory.isAdminAddress(provider, parsed);
                console.log(`  Admin Status: ${adminStatus === 2 ? 'Super Admin' : adminStatus === 1 ? 'Regular Admin' : 'Not Admin'} (${adminStatus})`);
            } catch (err: any) {
                console.error(`  Error checking ${addr}: ${err.message}`);
            }
        }
        
        // Get contract state
        console.log('\n\nContract State:');
        try {
            const isPaused = await factory.getIsPaused(provider);
            console.log(`  Paused: ${isPaused}`);
            
            const nextPropertyId = await factory.getNextPropertyId(provider);
            console.log(`  Next Property ID: ${nextPropertyId}`);
        } catch (err: any) {
            console.error(`  Error getting contract state: ${err.message}`);
        }
        
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
    }
}

// Run the test
testAdminStatus().catch(console.error);
