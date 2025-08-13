import { TonClient, Address } from '@ton/ton';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLastTransaction() {
    console.log('=== CHECKING LAST TRANSACTIONS ===\n');
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    // Check both addresses
    const addresses = [
        { name: 'Multi-Admin Contract', addr: 'EQA7n--u11cPQdY4zi_chGpu_WsHwOBs4Fc88pD2jDFSkD8J' },
        { name: 'Your Wallet', addr: 'EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb' }
    ];
    
    for (const { name, addr } of addresses) {
        console.log(`\n📍 ${name}:`);
        console.log(`   Address: ${addr}`);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const address = Address.parse(addr);
            const transactions = await client.getTransactions(address, { limit: 5 });
            
            console.log(`   Found ${transactions.length} recent transactions\n`);
            
            for (const tx of transactions) {
                const date = new Date(tx.now * 1000);
                const inMsg = tx.inMessage;
                
                console.log(`   Transaction: ${tx.hash.toString('base64')}`);
                console.log(`   Time: ${date.toISOString()}`);
                
                const desc = tx.description as any;
                const isComputed = desc.computePhase?.type === 'vm';
                console.log(`   Success: ${isComputed ? '✅' : '❌'}`);
                
                if (isComputed) {
                    const exitCode = desc.computePhase.exitCode;
                    console.log(`   Exit Code: ${exitCode} ${exitCode === 0 ? '(success)' : '(failed)'}`);
                    
                    if (exitCode !== 0) {
                        console.log(`   ⚠️ Transaction failed with exit code ${exitCode}`);
                        
                        // Common exit codes
                        const exitCodes: { [key: number]: string } = {
                            2: 'Stack underflow',
                            3: 'Stack overflow',
                            4: 'Integer overflow',
                            5: 'Integer out of expected range',
                            6: 'Invalid opcode',
                            7: 'Type check error',
                            8: 'Cell overflow',
                            9: 'Cell underflow',
                            10: 'Dictionary error',
                            11: 'Unknown error',
                            13: 'Out of gas',
                            32: 'Method ID not found',
                            34: 'Action is invalid or not supported',
                            37: 'Not enough TON',
                            38: 'Not enough extra-currencies',
                            401: 'Not admin (custom)',
                            402: 'Not super admin (custom)',
                            403: 'Contract paused (custom)',
                            404: 'Property not found (custom)',
                            405: 'Property inactive (custom)',
                            406: 'Insufficient tokens (custom)',
                            407: 'Insufficient payment (custom)',
                            408: 'Invalid amount (custom)',
                            409: 'Already admin (custom)',
                            410: 'Not token holder (custom)'
                        };
                        
                        if (exitCodes[exitCode]) {
                            console.log(`   Error: ${exitCodes[exitCode]}`);
                        }
                    }
                }
                
                if (inMsg?.info?.type === 'internal') {
                    console.log(`   From: ${inMsg.info.src?.toString() || 'External'}`);
                    console.log(`   Value: ${(Number(inMsg.info.value?.coins || 0) / 1e9).toFixed(3)} TON`);
                }
                
                console.log('   ---');
            }
            
        } catch (error: any) {
            if (error.message?.includes('429')) {
                console.log('   ⏱️ Rate limited, waiting...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error(`   Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n💡 Check the explorer for more details:');
    console.log('   https://testnet.tonscan.org/address/EQA7n--u11cPQdY4zi_chGpu_WsHwOBs4Fc88pD2jDFSkD8J');
}

checkLastTransaction().catch(console.error);
