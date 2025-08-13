import { Address } from '@ton/ton';
import contractConfig from '../src/dapp/src/config/contract.json';

console.log('=== REITx Contract Admin Diagnosis ===\n');

// The deployed contract details
console.log('🏭 DEPLOYED CONTRACT:');
console.log('  Address:', contractConfig.factoryAddress);
console.log('  Network:', contractConfig.network);

// The admin stored in the contract (verified from blockchain)
const contractAdmin = 'EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb';
console.log('\n👤 ADMIN STORED IN CONTRACT:');
console.log('  Address:', contractAdmin);
console.log('  Raw:', Address.parse(contractAdmin).toRawString());

// Config file admins
console.log('\n📋 CONFIG FILE ADMINS:');
console.log('  Super Admin:', contractConfig.superAdmin);
console.log('  Regular Admins:', contractConfig.admins);

// Check if they match
console.log('\n🔍 VERIFICATION:');
const configMatchesContract = contractConfig.superAdmin === contractAdmin;
console.log('  Config matches contract:', configMatchesContract ? '✅ YES' : '❌ NO');

console.log('\n⚠️  IMPORTANT:');
console.log('  To create properties, you MUST connect a wallet with this address:');
console.log('  ' + contractAdmin);
console.log('\n  If your wallet has a different address, the transaction will fail.');
console.log('  The contract only accepts transactions from its stored admin address.');

console.log('\n💡 SOLUTIONS:');
console.log('  1. Use the wallet that has address:', contractAdmin);
console.log('  2. OR deploy a new contract with your wallet as admin');
console.log('  3. OR ask the current admin to add your address as an admin');

// Check if user might be using wrong address format
console.log('\n📝 NOTE ABOUT ADDRESS FORMATS:');
console.log('  TON addresses can start with EQ, UQ, or 0Q but represent the same address.');
console.log('  Make sure you\'re using the exact wallet that owns this address.');
