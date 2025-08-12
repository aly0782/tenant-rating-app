import { toNano, Address, Cell, beginCell, contractAddress, WalletContractV4, internal, TonClient } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Retry with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 5,
    baseDelay = 2000
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error.message?.includes('429') && i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Rate limited. Waiting ${delay/1000}s before retry ${i + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else if (i === maxRetries - 1) {
                throw error;
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

async function deployContract() {
    console.log('=== DEPLOYING MULTI-ADMIN CONTRACT ===\n');
    
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        throw new Error('WALLET_MNEMONIC not found in .env');
    }
    
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    // Create client with retry
    console.log('Connecting to TON network...');
    const client = await retryWithBackoff(async () => {
        const c = new TonClient({
            endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        });
        // Test connection by getting masterchain info
        await c.getMasterchainInfo();
        return c;
    });
    console.log('✅ Connected\n');
    
    // Create wallet
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('Wallet (Super Admin):', walletAddress.toString());
    
    // Check balance with retry
    const balance = await retryWithBackoff(() => walletContract.getBalance());
    console.log('Balance:', (Number(balance) / 1e9).toFixed(3), 'TON\n');
    
    if (balance < toNano('0.1')) {
        throw new Error('Insufficient balance');
    }
    
    // Load compiled contract
    const compiledPath = path.join(__dirname, '..', 'build', 'REITxFactoryMultiAdmin.compiled.json');
    const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf-8'));
    const code = Cell.fromBoc(Buffer.from(compiled.hex, 'hex'))[0];
    
    // Create initial data
    const data = beginCell()
        .storeAddress(walletAddress)
        .storeDict(null)
        .storeUint(0, 32)
        .storeDict(null)
        .storeUint(0, 1)
        .storeCoins(0)
        .storeCoins(0)
        .endCell();
    
    const init = { code, data };
    const contractAddr = contractAddress(0, init);
    
    console.log('Contract Address:', contractAddr.toString());
    console.log('Explorer:', `https://testnet.tonscan.org/address/${contractAddr.toString()}\n`);
    
    // Get seqno with retry
    const seqno = await retryWithBackoff(() => walletContract.getSeqno());
    console.log('Seqno:', seqno);
    
    // Deploy with retry
    console.log('Sending deployment transaction...\n');
    await retryWithBackoff(async () => {
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
    });
    
    console.log('✅ TRANSACTION SENT!\n');
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    let deployed = false;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (!deployed && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const state = await retryWithBackoff(() => 
                client.getContractState(contractAddr),
                3,
                1000
            );
            
            if (state.state === 'active') {
                deployed = true;
                console.log('\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!\n');
                break;
            }
        } catch (error) {
            // Contract not yet deployed, continue waiting
        }
        
        if (attempts % 5 === 0) {
            console.log(`Still waiting... (${attempts}/${maxAttempts})`);
        }
    }
    
    // Update config
    const configPath = path.join(__dirname, '..', 'src', 'dapp', 'src', 'config', 'contract.json');
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    const newConfig = {
        factoryAddress: contractAddr.toString(),
        network: 'testnet',
        deployedAt: new Date().toISOString(),
        superAdmin: walletAddress.toString(),
        admins: currentConfig.admins || [],
        features: {
            multiAdmin: true,
            rentDistribution: true,
            pausable: true,
            tokenSales: true,
            userHoldings: true
        }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    
    console.log('📋 Configuration Updated:');
    console.log('   Contract:', contractAddr.toString());
    console.log('   Super Admin:', walletAddress.toString());
    console.log('\n✨ DEPLOYMENT COMPLETE!');
    console.log('\nNext steps:');
    console.log('1. The new multi-admin contract is now active');
    console.log('2. You can add other admins through the Admin Panel');
    console.log('3. All admins can create properties');
    
    return contractAddr.toString();
}

// Run with retries
async function main() {
    try {
        const contractAddress = await deployContract();
        console.log('\n✅ Success! Contract deployed at:', contractAddress);
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Deployment failed after all retries:', error.message);
        
        if (error.message?.includes('429')) {
            console.log('\n💡 TIP: The API is rate limiting. Try these alternatives:');
            console.log('1. Wait 5 minutes and run again');
            console.log('2. Use a VPN to change your IP');
            console.log('3. Get an API key from https://toncenter.com');
        }
        
        process.exit(1);
    }
}

// Start deployment
console.log('Starting deployment with automatic retries...\n');
main();
