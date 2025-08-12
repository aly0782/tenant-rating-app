import { Address, toNano, beginCell } from '@ton/core';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

async function createPropertyDirect() {
    console.log('🏗️  Creating Property Directly\n');

    // Initialize client
    const client = new TonClient({
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });

    // Contract address
    const contractAddress = Address.parse('EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF');
    console.log('📋 Contract Address:', contractAddress.toString());

    // Your wallet mnemonic (replace with your actual mnemonic)
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ Please set WALLET_MNEMONIC environment variable');
        console.log('Example: WALLET_MNEMONIC="word1 word2 ..." npx ts-node scripts/createPropertyDirect.ts');
        return;
    }

    // Create wallet
    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({
        publicKey: key.publicKey,
        workchain: 0,
    });
    
    const walletAddress = wallet.address;
    console.log('👛 Wallet Address:', walletAddress.toString());

    // Check wallet balance
    const balance = await client.getBalance(walletAddress);
    console.log('💰 Wallet Balance:', Number(balance) / 1e9, 'TON');

    if (balance < toNano('0.5')) {
        console.error('❌ Insufficient balance. Need at least 0.5 TON');
        return;
    }

    // Property details
    const propertyData = {
        name: 'Patua Restaurant',
        location: 'Lisboa',
        totalSupply: toNano('1000'),  // 1000 tokens
        pricePerToken: toNano('0.005'), // 0.005 TON per token
        monthlyRent: toNano('0.5'), // 0.5 TON monthly rent
        uri: 'https://gateway.pinata.cloud/ipfs/Qmb1yarT1nUCvRT1cjHaVXGSPVVZjUbMY8T2q6NFsobJWU'
    };

    console.log('\n📝 Property Details:');
    console.log('  Name:', propertyData.name);
    console.log('  Location:', propertyData.location);
    console.log('  Total Supply:', Number(propertyData.totalSupply) / 1e9, 'TON worth of tokens');
    console.log('  Price per Token:', Number(propertyData.pricePerToken) / 1e9, 'TON');
    console.log('  Monthly Rent:', Number(propertyData.monthlyRent) / 1e9, 'TON');

    // Build the message
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

    console.log('\n📤 Sending transaction...');

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: contractAddress,
                value: toNano('0.5'), // 0.5 TON for gas
                body: message,
                bounce: true,
            })
        ]
    });

    console.log('✅ Transaction sent!');
    console.log('⏳ Waiting for confirmation...');

    // Wait for transaction to be confirmed
    let currentSeqno = seqno;
    while (currentSeqno == seqno) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        currentSeqno = await walletContract.getSeqno();
    }

    console.log('✅ Transaction confirmed!');
    
    // Wait a bit more for the contract to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify property was created
    console.log('\n🔍 Verifying property creation...');
    
    const { REITxFactory } = await import('../wrappers/REITxFactory');
    const factory = REITxFactory.createFromAddress(contractAddress);
    const provider = client.provider(factory.address);

    try {
        const nextPropertyId = await factory.getNextPropertyId(provider as any);
        console.log('✅ Next Property ID:', nextPropertyId);
        
        if (nextPropertyId > 0) {
            // Try to fetch the first property
            const propertyInfo = await factory.getPropertyInfo(provider as any, 0);
            console.log('\n✅ Property 0 Created Successfully:');
            console.log('  Name:', propertyInfo.name);
            console.log('  Location:', propertyInfo.location);
            console.log('  Total Supply:', propertyInfo.totalSupply.toString());
            console.log('  Available Tokens:', propertyInfo.availableTokens.toString());
        } else {
            console.log('⚠️  Property was not created. Check contract logs.');
        }
    } catch (err) {
        console.error('❌ Error verifying property:', err);
    }
}

createPropertyDirect().catch(console.error);