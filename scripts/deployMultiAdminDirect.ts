import { toNano, Address, Cell, beginCell, contractAddress, Contract, ContractProvider, Sender, SendMode, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import { compile } from '@ton/blueprint';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    // Get mnemonic from environment
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error('WALLET_MNEMONIC not found in environment');
    }
    
    // Create wallet from mnemonic
    const mnemonicArray = mnemonic.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonicArray);
    
    // Connect to testnet with fallback endpoints
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        apiKey: undefined // Can add API key if available
    });
    
    // Create wallet contract
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('Deploying REITx Factory with Multi-Admin support...');
    console.log('Super Admin will be:', walletAddress.toString());
    
    // Compile the contract
    const code = await compile('REITxFactoryMultiAdmin');
    
    // Create initial data
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
    
    console.log('Contract will be deployed to:', contractAddr.toString());
    
    // Check balance
    const balance = await walletContract.getBalance();
    console.log('Wallet balance:', balance / 1000000000n, 'TON');
    
    if (balance < toNano('0.1')) {
        console.error('Insufficient balance! Need at least 0.1 TON');
        console.log('Get test TON from: https://t.me/testgiver_ton_bot');
        return;
    }
    
    // Deploy the contract
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
    
    console.log('Transaction sent! Waiting for confirmation...');
    
    // Wait for deployment
    let deployed = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const state = await client.getContractState(contractAddr);
        if (state.state === 'active') {
            deployed = true;
            break;
        }
    }
    
    if (deployed) {
        console.log('✅ REITx Multi-Admin Factory deployed successfully!');
        console.log('Contract address:', contractAddr.toString());
        console.log('');
        console.log('Next steps:');
        console.log('1. Update the contract address in your dApp configuration');
        console.log('2. Add additional admins using the admin panel');
        console.log('3. Create your first property through the admin panel');
        
        // Save contract address to config
        const fs = require('fs');
        const configPath = './src/dapp/src/config/contract.json';
        const config = {
            factoryAddress: contractAddr.toString(),
            network: 'testnet',
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
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('');
        console.log('Contract configuration saved to:', configPath);
    } else {
        console.error('Deployment timeout - check the explorer for status');
        console.log('Explorer URL:', `https://testnet.tonscan.org/address/${contractAddr.toString()}`);
    }
}

main().catch(console.error);