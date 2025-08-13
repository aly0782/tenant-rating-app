import { toNano, Address, Cell, beginCell, contractAddress, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
    console.log('=== Deploy REITx Multi-Admin Factory (Alternative) ===\n');
    
    // Get mnemonic from environment
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ WALLET_MNEMONIC not found in .env file');
        return;
    }
    
    // Create wallet from mnemonic
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    // Try alternative endpoints
    const endpoints = [
        'https://testnet.toncenter.com/api/v2/jsonRPC',
        'https://testnet.tonapi.io/v2',
        'https://testnet-v4.tonhubapi.com',
    ];
    
    let client: TonClient | null = null;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Trying endpoint: ${endpoint}...`);
            client = new TonClient({ endpoint });
            
            // Test connection
            await client.getWorkchainInfo(0);
            console.log('✅ Connected successfully\n');
            break;
        } catch (error) {
            console.log('❌ Failed, trying next...');
            client = null;
        }
    }
    
    if (!client) {
        console.error('❌ Could not connect to any endpoint');
        return;
    }
    
    // Create wallet contract
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('📱 Your wallet (will be super admin):', walletAddress.toString());
    
    // Load compiled contract
    const compiledPath = path.join(__dirname, '..', 'build', 'REITxFactoryMultiAdmin.compiled.json');
    const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf-8'));
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Create initial data
    const data = beginCell()
        .storeAddress(walletAddress)  // super_admin
        .storeDict(null)               // admins (empty)
        .storeUint(0, 32)              // next_property_id
        .storeDict(null)               // properties
        .storeUint(0, 1)               // paused (false)
        .storeCoins(0)                 // total_funds_raised
        .storeCoins(0)                 // total_rent_distributed
        .endCell();
    
    // Calculate contract address
    const init = { code, data };
    const contractAddr = contractAddress(0, init);
    
    console.log('\n📄 Contract will be deployed to:');
    console.log('   ' + contractAddr.toString());
    
    try {
        // Check balance
        const balance = await walletContract.getBalance();
        console.log('\n💰 Balance:', (Number(balance) / 1e9).toFixed(3), 'TON');
        
        if (balance < toNano('0.1')) {
            console.error('❌ Need at least 0.1 TON');
            return;
        }
        
        // Deploy
        const seqno = await walletContract.getSeqno();
        await walletContract.sendTransfer({
            secretKey: keyPair.secretKey,
            seqno,
            messages: [
                internal({
                    to: contractAddr,
                    value: toNano('0.05'),
                    init,
                    body: beginCell().endCell()
                })
            ]
        });
        
        console.log('\n✅ Transaction sent!');
        console.log('   Wait 30-60 seconds for confirmation');
        console.log('\n📝 Check deployment:');
        console.log(`   https://testnet.tonscan.org/address/${contractAddr.toString()}`);
        
        // Update config
        const configPath = path.join(__dirname, '..', 'src', 'dapp', 'src', 'config', 'contract.json');
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        const newConfig = {
            ...currentConfig,
            factoryAddress: contractAddr.toString(),
            deployedAt: new Date().toISOString(),
            superAdmin: walletAddress.toString(),
            features: {
                multiAdmin: true,
                rentDistribution: true,
                pausable: true,
                tokenSales: true,
                userHoldings: true
            }
        };
        
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log('\n📋 Config updated with new contract address');
        
    } catch (error: any) {
        if (error.message?.includes('429')) {
            console.error('\n⏱️ Rate limited. Please wait 2-3 minutes and try again.');
        } else {
            console.error('\n❌ Error:', error.message);
        }
    }
}

main().catch(console.error);
