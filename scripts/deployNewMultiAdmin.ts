import { toNano, Address, Cell, beginCell, contractAddress, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import { compile } from '@ton/blueprint';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
    console.log('=== Deploy REITx Multi-Admin Factory ===\n');
    
    // Get mnemonic from environment
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ WALLET_MNEMONIC not found in .env file');
        console.log('\nPlease add your wallet mnemonic to .env file:');
        console.log('WALLET_MNEMONIC="your 24 word mnemonic phrase here"');
        return;
    }
    
    // Create wallet from mnemonic
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    // Connect to testnet with retry logic
    console.log('Connecting to TON testnet...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Initial delay
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TONCENTER_API_KEY // Optional API key
    });
    
    // Create wallet contract
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('📱 Deploying from wallet:', walletAddress.toString());
    console.log('   Raw address:', walletAddress.toRawString());
    
    // Check balance with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const balance = await walletContract.getBalance();
    console.log('💰 Wallet balance:', (Number(balance) / 1e9).toFixed(3), 'TON');
    
    if (balance < toNano('0.1')) {
        console.error('\n❌ Insufficient balance! Need at least 0.1 TON');
        console.log('   Get test TON from: https://t.me/testgiver_ton_bot');
        console.log('   Send it to:', walletAddress.toString());
        return;
    }
    
    console.log('\n🔨 Compiling contract...');
    
    // Load compiled contract
    const compiledPath = path.join(__dirname, '..', 'build', 'REITxFactoryMultiAdmin.compiled.json');
    if (!fs.existsSync(compiledPath)) {
        console.error('❌ Contract not compiled. Run: npx blueprint build REITxFactoryMultiAdmin');
        return;
    }
    
    const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf-8'));
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Create initial data with multi-admin support
    const data = beginCell()
        .storeAddress(walletAddress)  // super_admin
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
    
    console.log('\n📄 New contract will be deployed to:');
    console.log('   Address:', contractAddr.toString());
    console.log('   Raw:', contractAddr.toRawString());
    
    // Get current config
    const configPath = path.join(__dirname, '..', 'src', 'dapp', 'src', 'config', 'contract.json');
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('   Current contract:', currentConfig.factoryAddress);
    console.log('   Will be replaced with new multi-admin contract');
    
    // Ask for confirmation
    console.log('\n🚀 Ready to deploy. The transaction will:');
    console.log('   1. Deploy a new multi-admin contract');
    console.log('   2. Set your wallet as super admin');
    console.log('   3. Update the config file');
    console.log('\nStarting deployment in 5 seconds... (Ctrl+C to cancel)');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Deploy the contract with delay for rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    const seqno = await walletContract.getSeqno();
    console.log('\n📤 Sending deployment transaction...');
    
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
    
    console.log('✅ Transaction sent! Waiting for confirmation...');
    
    // Wait for deployment
    let deployed = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            const state = await client.getContractState(contractAddr);
            if (state.state === 'active') {
                deployed = true;
                break;
            }
        } catch (error) {
            // Contract not yet deployed
        }
        
        if (i % 5 === 0) {
            console.log('   Still waiting...');
        }
    }
    
    if (deployed) {
        console.log('\n✅ REITx Multi-Admin Factory deployed successfully!');
        console.log('   Contract address:', contractAddr.toString());
        
        // Get the admins from old config to add to new contract
        const adminsToAdd = currentConfig.admins || [];
        
        // Save new config
        const newConfig = {
            factoryAddress: contractAddr.toString(),
            network: 'testnet',
            deployedAt: new Date().toISOString(),
            superAdmin: walletAddress.toString(),
            admins: adminsToAdd, // Keep the same admins list for reference
            features: {
                multiAdmin: true,
                rentDistribution: true,
                pausable: true,
                tokenSales: true,
                userHoldings: true
            }
        };
        
        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log('\n📝 Configuration updated');
        
        console.log('\n✨ Next steps:');
        console.log('   1. The new contract is now active with multi-admin support');
        console.log('   2. You are the super admin and can create properties');
        console.log('   3. Add other admins through the Admin Panel');
        
        if (adminsToAdd.length > 0) {
            console.log('\n📋 Admins to add (from previous config):');
            adminsToAdd.forEach((admin: string) => console.log('   -', admin));
            console.log('   Use the Admin Panel to add these addresses');
        }
        
        console.log('\n🔗 View on explorer:');
        console.log(`   https://testnet.tonscan.org/address/${contractAddr.toString()}`);
        
    } else {
        console.error('\n⏱️ Deployment timeout - check the explorer for status');
        console.log(`   https://testnet.tonscan.org/address/${contractAddr.toString()}`);
        console.log('\n   If deployed, manually update config with:');
        console.log('   Contract address:', contractAddr.toString());
    }
}

main().catch(error => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
});
