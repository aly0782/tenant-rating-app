import { mnemonicToPrivateKey, mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';
import { TonClient } from '@ton/ton';

async function main() {
    // Get mnemonic from environment
    const mnemonic = process.env.WALLET_MNEMONIC;
    if (!mnemonic) {
        console.error('❌ WALLET_MNEMONIC not set in .env file');
        process.exit(1);
    }

    try {
        // Convert mnemonic to key pair - using Tonkeeper's method
        const mnemonicArray = mnemonic.split(' ');
        const keyPair = await mnemonicToWalletKey(mnemonicArray);
        
        // Create wallet - V4R2 is what Tonkeeper uses
        const wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keyPair.publicKey
        });
        
        console.log('📱 Wallet Information:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📍 Address:', wallet.address.toString());
        console.log('🌐 Network: TON Testnet');
        console.log('');
        console.log('🔗 View on Explorer:');
        console.log(`   https://testnet.tonscan.org/address/${wallet.address.toString()}`);
        console.log('');
        
        // Check balance
        const client = new TonClient({
            endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
        });
        
        const balance = await client.getBalance(wallet.address);
        const balanceInTON = Number(balance) / 1e9;
        
        console.log('💰 Balance:', balanceInTON.toFixed(4), 'TON');
        
        if (balanceInTON < 0.5) {
            console.log('');
            console.log('⚠️  Low balance! You need at least 0.5 TON for deployment.');
            console.log('');
            console.log('💸 Get test TON:');
            console.log('   1. Copy the address above');
            console.log('   2. Visit: https://t.me/testgiver_ton_bot');
            console.log('   3. Send the address to get test TON');
        } else {
            console.log('✅ Sufficient balance for deployment!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

main();