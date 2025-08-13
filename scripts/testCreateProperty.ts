import { toNano, Address, Cell, beginCell, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient } from '@ton/ton';
import * as dotenv from 'dotenv';

dotenv.config();

async function testCreateProperty() {
    console.log('=== TEST CREATE PROPERTY ON MULTI-ADMIN CONTRACT ===\n');
    
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ WALLET_MNEMONIC not found');
        return;
    }
    
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
    
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = walletContract.address;
    
    console.log('Wallet (Super Admin):', walletAddress.toString());
    console.log('Raw:', walletAddress.toRawString());
    
    // New multi-admin contract
    const contractAddr = Address.parse('EQA7n--u11cPQdY4zi_chGpu_WsHwOBs4Fc88pD2jDFSkD8J');
    console.log('\nContract:', contractAddr.toString());
    
    // Check balance
    await new Promise(resolve => setTimeout(resolve, 1500));
    const balance = await walletContract.getBalance();
    console.log('Balance:', (Number(balance) / 1e9).toFixed(3), 'TON');
    
    // Check contract state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const state = await client.getContractState(contractAddr);
    console.log('\nContract State:', state.state);
    console.log('Contract Balance:', (Number(state.balance) / 1e9).toFixed(3), 'TON');
    
    // Build the message for creating property
    const propertyData = {
        name: 'Test Property',
        location: 'Test Location',
        totalSupply: toNano('1000'),
        pricePerToken: toNano('0.01'),
        monthlyRent: toNano('5'),
        uri: 'https://test.com/metadata.json'
    };
    
    console.log('\n📦 Creating property:');
    console.log('  Name:', propertyData.name);
    console.log('  Location:', propertyData.location);
    console.log('  Supply:', propertyData.totalSupply.toString());
    console.log('  Price:', propertyData.pricePerToken.toString());
    
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
    
    console.log('\nMessage payload:', message.toBoc().toString('base64'));
    
    // Get seqno
    await new Promise(resolve => setTimeout(resolve, 1500));
    const seqno = await walletContract.getSeqno();
    console.log('Seqno:', seqno);
    
    console.log('\n📤 Sending transaction...');
    
    try {
        await walletContract.sendTransfer({
            secretKey: keyPair.secretKey,
            seqno,
            messages: [
                internal({
                    to: contractAddr,
                    value: toNano('1'), // 1 TON for gas
                    body: message,
                })
            ]
        });
        
        console.log('✅ Transaction sent!');
        
        // Wait for confirmation
        console.log('\nWaiting for confirmation...');
        let currentSeqno = seqno;
        let attempts = 0;
        while (currentSeqno === seqno && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            currentSeqno = await walletContract.getSeqno();
            attempts++;
            if (attempts % 5 === 0) {
                console.log('Still waiting...');
            }
        }
        
        if (currentSeqno > seqno) {
            console.log('✅ Transaction confirmed!');
            
            // Check result
            console.log('\nChecking result...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Try to get next property ID
            console.log('\n📊 Checking contract state after transaction...');
            
            // Check on explorer
            console.log('\n🔗 View transaction on explorer:');
            console.log(`https://testnet.tonscan.org/address/${contractAddr.toString()}`);
            
        } else {
            console.log('⏱️ Transaction timeout');
        }
        
    } catch (error: any) {
        console.error('\n❌ Transaction failed:', error.message);
        
        if (error.message?.includes('exitcode')) {
            console.log('\n💡 Exit code indicates contract rejected the transaction');
            console.log('Possible reasons:');
            console.log('  - Not recognized as admin');
            console.log('  - Contract is paused');
            console.log('  - Invalid message format');
        }
    }
}

testCreateProperty().catch(console.error);
