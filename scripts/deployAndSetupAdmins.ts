import { toNano, Address, Cell, beginCell, contractAddress, Contract, ContractProvider, Sender, SendMode, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import { compile } from '@ton/blueprint';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    // Get mnemonic from environment
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error('WALLET_MNEMONIC not found in environment');
    }
    
    // Create wallet from mnemonic
    const mnemonicArray = mnemonic.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonicArray);
    
    // Connect to testnet with multiple fallback endpoints
    let client: TonClient | null = null;
    const endpoints = [
        'https://testnet.toncenter.com/api/v2/jsonRPC',
        'https://testnet.tonapi.io/v2',
        'https://testnet-v4.tonhubapi.com'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Trying endpoint: ${endpoint}`);
            client = new TonClient({ endpoint });
            // Test the connection
            await client.getBalance(Address.parse('EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb'));
            console.log(`Connected to: ${endpoint}`);
            break;
        } catch (err) {
            console.log(`Failed to connect to ${endpoint}, trying next...`);
        }
    }
    
    if (!client) {
        throw new Error('Could not connect to any TON endpoint');
    }
    
    // Create wallet contract
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('='.repeat(60));
    console.log('REITx Multi-Admin Factory Deployment');
    console.log('='.repeat(60));
    console.log('Deployer wallet:', walletAddress.toString());
    
    // Check balance
    const balance = await walletContract.getBalance();
    console.log('Wallet balance:', (Number(balance) / 1e9).toFixed(2), 'TON');
    
    if (balance < toNano('0.5')) {
        console.error('Insufficient balance! Need at least 0.5 TON');
        return;
    }
    
    // Compile the contract
    console.log('\n📦 Compiling contract...');
    const code = await compile('REITxFactoryMultiAdmin');
    console.log('✅ Contract compiled successfully');
    
    // Create initial data with the deployer as super admin
    const data = beginCell()
        .storeAddress(walletAddress)  // super_admin (deployer)
        .storeDict(null)               // admins (empty initially)
        .storeUint(0, 32)              // next_property_id
        .storeDict(null)               // properties (empty)
        .storeUint(0, 1)               // paused (false)
        .storeCoins(0)                 // total_funds_raised
        .storeCoins(0)                 // total_rent_distributed
        .endCell();
    
    // Calculate contract address
    const init = { code, data };
    const contractAddr = contractAddress(0, init);
    
    console.log('\n📍 Contract address:', contractAddr.toString());
    
    // Deploy the contract
    console.log('\n🚀 Deploying contract...');
    const seqno = await walletContract.getSeqno();
    
    await walletContract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
        messages: [
            internal({
                to: contractAddr,
                value: toNano('0.1'),
                init,
                body: beginCell().endCell(),
                bounce: false
            })
        ]
    });
    
    console.log('Transaction sent! Waiting for confirmation...');
    
    // Wait for deployment
    let deployed = false;
    for (let i = 0; i < 30; i++) {
        await sleep(3000);
        try {
            const state = await client.getContractState(contractAddr);
            if (state.state === 'active') {
                deployed = true;
                break;
            }
        } catch (err) {
            // Contract not yet deployed
        }
        process.stdout.write('.');
    }
    
    if (!deployed) {
        console.error('\n❌ Deployment timeout - please check manually');
        console.log('Explorer URL:', `https://testnet.tonscan.org/address/${contractAddr.toString()}`);
        return;
    }
    
    console.log('\n✅ Contract deployed successfully!');
    
    // Now add the additional admins
    console.log('\n👥 Adding additional admins...');
    
    const adminsToAdd = [
        'UQArJIGQC7pe2CkdKQOwPOrjUjUOp4YgIC89SH8vKnd7HjQm',
        '0QAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve2LU'
    ];
    
    for (const adminAddr of adminsToAdd) {
        try {
            console.log(`\nAdding admin: ${adminAddr}`);
            
            const adminAddress = Address.parse(adminAddr);
            const addAdminMessage = beginCell()
                .storeUint(0xddccbbaa, 32) // op::add_admin
                .storeUint(Date.now(), 64)  // query_id
                .storeAddress(adminAddress)
                .endCell();
            
            const currentSeqno = await walletContract.getSeqno();
            
            await walletContract.sendTransfer({
                secretKey: keyPair.secretKey,
                seqno: currentSeqno,
                messages: [
                    internal({
                        to: contractAddr,
                        value: toNano('0.05'),
                        body: addAdminMessage,
                        bounce: true
                    })
                ]
            });
            
            console.log(`✅ Admin ${adminAddr.slice(0, 8)}... added successfully`);
            await sleep(5000); // Wait between transactions
            
        } catch (err) {
            console.error(`❌ Failed to add admin ${adminAddr}:`, err);
        }
    }
    
    // Save configuration
    console.log('\n💾 Saving configuration...');
    
    const configPath = './src/dapp/src/config/contract.json';
    const config = {
        factoryAddress: contractAddr.toString(),
        network: 'testnet',
        deployedAt: new Date().toISOString(),
        superAdmin: walletAddress.toString(),
        admins: adminsToAdd,
        features: {
            multiAdmin: true,
            rentDistribution: true,
            pausable: true,
            tokenSales: true,
            userHoldings: true
        }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Configuration saved to:', configPath);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEPLOYMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log('  Contract:', contractAddr.toString());
    console.log('  Super Admin:', walletAddress.toString());
    console.log('  Additional Admins:', adminsToAdd.length);
    console.log('  Network:', 'testnet');
    console.log('\n🔗 Links:');
    console.log('  Explorer:', `https://testnet.tonscan.org/address/${contractAddr.toString()}`);
    console.log('  Admin Panel:', 'http://localhost:5173/admin');
    console.log('\n📝 Next Steps:');
    console.log('  1. Visit the Admin Panel to create properties');
    console.log('  2. Test buying tokens from a user wallet');
    console.log('  3. Distribute rent to token holders');
}

main().catch(console.error);