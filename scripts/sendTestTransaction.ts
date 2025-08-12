import { Address, TonClient, beginCell, toNano, WalletContractV4, internal } from '@ton/ton';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { Buffer } from 'buffer';

async function sendTestTransaction() {
    // You need to set your mnemonic in environment variable
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('Please set MNEMONIC environment variable');
        process.exit(1);
    }
    
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });
    
    // Create wallet from mnemonic
    const key = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    const walletContract = client.open(wallet);
    const walletAddress = wallet.address;
    
    console.log('Wallet address:', walletAddress.toString());
    
    const contractAddress = 'EQBjReZcFpm2sJc8Yo2MQb6RwH8n_mBXq6pXsE7CVohASqkF';
    const contract = Address.parse(contractAddress);
    
    // Create the property creation message
    const message = beginCell()
        .storeUint(0x12345678, 32) // op::create_property
        .storeUint(Date.now(), 64) // query_id with timestamp
        .storeRef(beginCell().storeBuffer(Buffer.from('Demo Property')).endCell())
        .storeRef(beginCell().storeBuffer(Buffer.from('Lisbon, Portugal')).endCell())
        .storeCoins(toNano('1000')) // 1000 tokens
        .storeCoins(toNano('0.005')) // 0.005 TON per token
        .storeCoins(toNano('0.5')) // 0.5 TON monthly rent
        .storeRef(beginCell().storeBuffer(Buffer.from('https://demo.reitx.com/property1')).endCell())
        .endCell();
    
    console.log('Sending transaction to create property...');
    console.log('Contract address:', contractAddress);
    console.log('Message payload:', message.toBoc().toString('base64'));
    
    try {
        const seqno = await walletContract.getSeqno();
        console.log('Wallet seqno:', seqno);
        
        // Send transaction
        await walletContract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [
                internal({
                    to: contract,
                    value: toNano('0.5'), // 0.5 TON for gas
                    body: message,
                    bounce: true
                })
            ]
        });
        
        console.log('Transaction sent! Waiting for confirmation...');
        
        // Wait for transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Check if property was created
        const result = await client.runMethod(contract, 'get_next_property_id', []);
        const nextId = result.stack.readNumber();
        console.log('Next property ID after transaction:', nextId);
        
        if (nextId > 0) {
            console.log('✅ Property created successfully!');
        } else {
            console.log('❌ Property creation failed');
        }
        
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
}

sendTestTransaction().catch(console.error);