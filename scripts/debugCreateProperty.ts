import { Address, TonClient, WalletContractV4, beginCell, toNano, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { REITxFactory } from '../wrappers/REITxFactory';
import contractConfig from '../src/dapp/src/config/contract.json';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugCreateProperty() {
    console.log('Debug: Creating property...\n');
    
    // Check for mnemonic
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('Please set MNEMONIC in .env file');
        process.exit(1);
    }
    
    // Initialize TON client
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    try {
        // Get wallet from mnemonic
        const key = await mnemonicToPrivateKey(mnemonic.split(' '));
        const wallet = WalletContractV4.create({
            publicKey: key.publicKey,
            workchain: 0
        });
        
        const walletAddress = wallet.address;
        console.log('Wallet address:', walletAddress.toString());
        console.log('Wallet raw:', walletAddress.toRawString());
        
        // Parse contract address
        const factoryAddress = Address.parse(contractConfig.factoryAddress);
        console.log('Factory address:', factoryAddress.toString());
        
        // Create factory instance
        const factory = REITxFactory.createFromAddress(factoryAddress);
        const provider = client.provider(factoryAddress);
        
        // Check if wallet is admin
        console.log('\nChecking admin status...');
        const adminStatus = await factory.isAdminAddress(provider, walletAddress);
        console.log(`Admin Status: ${adminStatus === 2 ? 'Super Admin' : adminStatus === 1 ? 'Regular Admin' : 'Not Admin'} (${adminStatus})`);
        
        if (adminStatus === 0) {
            console.error('\n❌ Error: Wallet is not an admin!');
            console.log('\nConfigured admins:');
            console.log('  Super Admin:', contractConfig.superAdmin);
            console.log('  Regular Admins:', contractConfig.admins);
            process.exit(1);
        }
        
        // Check if contract is paused
        const isPaused = await factory.getIsPaused(provider);
        if (isPaused) {
            console.error('\n❌ Error: Contract is paused!');
            process.exit(1);
        }
        
        // Get wallet contract
        const walletContract = client.open(wallet);
        const seqno = await walletContract.getSeqno();
        console.log('Wallet seqno:', seqno);
        
        // Create property data
        const propertyData = {
            name: 'Debug Test Property',
            location: 'Test Location',
            totalSupply: toNano('1000'),
            pricePerToken: toNano('0.01'),
            monthlyRent: toNano('5'),
            uri: 'https://test.com/metadata.json'
        };
        
        console.log('\nProperty data:');
        console.log('  Name:', propertyData.name);
        console.log('  Location:', propertyData.location);
        console.log('  Total Supply:', propertyData.totalSupply.toString());
        console.log('  Price per Token:', propertyData.pricePerToken.toString());
        console.log('  Monthly Rent:', propertyData.monthlyRent.toString());
        console.log('  URI:', propertyData.uri);
        
        // Build message
        const message = beginCell()
            .storeUint(0x12345678, 32) // op::create_property
            .storeUint(0, 64) // query_id
            .storeRef(beginCell().storeStringTail(propertyData.name).endCell())
            .storeRef(beginCell().storeStringTail(propertyData.location).endCell())
            .storeCoins(propertyData.totalSupply)
            .storeCoins(propertyData.pricePerToken)
            .storeCoins(propertyData.monthlyRent)
            .storeRef(beginCell().storeStringTail(propertyData.uri).endCell())
            .endCell();
        
        console.log('\nMessage payload (base64):', message.toBoc().toString('base64'));
        console.log('Message hash:', message.hash().toString('hex'));
        
        // Send transaction
        console.log('\nSending transaction...');
        const transfer = walletContract.createTransfer({
            seqno,
            secretKey: key.secretKey,
            messages: [
                internal({
                    to: factoryAddress,
                    value: toNano('1'), // 1 TON for gas
                    body: message,
                })
            ]
        });
        
        await walletContract.send(transfer);
        console.log('Transaction sent!');
        
        // Wait for confirmation
        console.log('Waiting for confirmation...');
        let currentSeqno = seqno;
        while (currentSeqno === seqno) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            currentSeqno = await walletContract.getSeqno();
        }
        console.log('Transaction confirmed!');
        
        // Check if property was created
        console.log('\nChecking property creation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newPropertyId = await factory.getNextPropertyId(provider);
        console.log('Next Property ID:', newPropertyId);
        
        if (newPropertyId > 0) {
            try {
                const propertyInfo = await factory.getPropertyInfo(provider, newPropertyId - 1);
                console.log('\n✅ Property created successfully!');
                console.log('Property Info:', propertyInfo);
            } catch (err) {
                console.log('Could not fetch property info yet');
            }
        }
        
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
    }
}

// Run the debug script
debugCreateProperty().catch(console.error);
