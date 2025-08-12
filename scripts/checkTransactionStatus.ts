import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';

async function checkTransactionStatus() {
    console.log('🔍 Checking Recent Transactions\n');

    // Initialize client
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });

    // Contract address
    const contractAddress = Address.parse('EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF');
    console.log('📋 Contract Address:', contractAddress.toString());

    try {
        // Get recent transactions
        const transactions = await client.getTransactions(contractAddress, {
            limit: 10
        });

        console.log(`\n📊 Found ${transactions.length} recent transactions:\n`);

        for (const tx of transactions) {
            const date = new Date(tx.now * 1000);
            console.log(`Transaction at ${date.toLocaleString()}`);
            console.log(`  LT: ${tx.lt}`);
            
            if (tx.inMessage) {
                const inMsg = tx.inMessage;
                console.log(`  From: ${inMsg.info.src?.toString() || 'external'}`);
                if (inMsg.info.type === 'internal') {
                    console.log(`  Value: ${inMsg.info.value.coins} nanotons`);
                }
                
                if (inMsg.body.bits.length > 32) {
                    try {
                        const bodySlice = inMsg.body.beginParse();
                        const op = bodySlice.loadUint(32);
                        console.log(`  Op code: 0x${op.toString(16)}`);
                        
                        if (op === 0x12345678) {
                            console.log('  ✅ This is a CREATE_PROPERTY transaction!');
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
            
            if (tx.description.type === 'generic') {
                const generic = tx.description;
                if (generic.computePhase.type === 'vm') {
                    console.log(`  Exit code: ${generic.computePhase.exitCode}`);
                    if (generic.computePhase.exitCode !== 0) {
                        console.log('  ❌ Transaction failed with exit code:', generic.computePhase.exitCode);
                        
                        // Common exit codes
                        const exitCodes: { [key: number]: string } = {
                            2: 'Stack underflow',
                            3: 'Stack overflow',
                            4: 'Integer overflow',
                            5: 'Integer out of range',
                            6: 'Invalid opcode',
                            7: 'Type check error',
                            8: 'Cell overflow',
                            9: 'Cell underflow',
                            10: 'Dictionary error',
                            13: 'Out of gas',
                            32: 'Method ID not found',
                            34: 'Action is invalid',
                            37: 'Not enough TON',
                            38: 'Not enough extra-currencies',
                            401: 'Not admin (custom error)',
                            402: 'Paused (custom error)',
                            403: 'Property not found (custom error)',
                            404: 'Insufficient funds (custom error)',
                        };
                        
                        if (exitCodes[generic.computePhase.exitCode]) {
                            console.log(`  Error: ${exitCodes[generic.computePhase.exitCode]}`);
                        }
                    }
                } else if (generic.computePhase.type === 'skipped') {
                    console.log(`  Compute phase skipped: ${generic.computePhase.reason}`);
                }
                
                if (generic.actionPhase) {
                    console.log(`  Action phase: ${generic.actionPhase.success ? '✅ Success' : '❌ Failed'}`);
                    if (!generic.actionPhase.success) {
                        console.log(`  Action result code: ${generic.actionPhase.resultCode}`);
                    }
                }
            }
            
            console.log('---');
        }

        // Also check wallet transactions
        const walletAddress = Address.parse('0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b');
        console.log(`\n📊 Checking wallet transactions for: ${walletAddress.toString()}\n`);
        
        const walletTxs = await client.getTransactions(walletAddress, {
            limit: 5
        });

        for (const tx of walletTxs) {
            const date = new Date(tx.now * 1000);
            if (tx.outMessagesCount > 0) {
                console.log(`Outgoing transaction at ${date.toLocaleString()}`);
                for (let i = 0; i < tx.outMessagesCount; i++) {
                    const msg = tx.outMessages.get(i);
                    if (msg && msg.info.dest) {
                        const destAddr = msg.info.dest.toString();
                        console.log(`  To: ${destAddr}`);
                        if (destAddr === contractAddress.toString()) {
                            console.log('  ✅ This is a transaction to the REITx contract!');
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTransactionStatus().catch(console.error);