import { Address } from '@ton/ton';

// Test address conversion
const addresses = [
    '0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b',
    'EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb',
    'UQArJIGQC7pe2CkdKQOwPOrjUjUOp4YgIC89SH8vKnd7HjQm',
    '0QAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve2LU'
];

console.log('Testing address formats:\n');

addresses.forEach(addr => {
    try {
        const parsed = Address.parse(addr);
        console.log(`Input: ${addr}`);
        console.log(`  Raw: ${parsed.toRawString()}`);
        console.log(`  User-friendly (bounceable): ${parsed.toString()}`);
        console.log(`  User-friendly (non-bounceable): ${parsed.toString({ bounceable: false })}`);
        console.log(`  Workchain: ${parsed.workChain}`);
        console.log('');
    } catch (error) {
        console.log(`Failed to parse: ${addr}`);
        console.log(`  Error: ${error}\n`);
    }
});

// Your wallet address
const yourWallet = Address.parse('0:1c9afce72bd4565ac5f357291f80f9e15dfdc479d411fe9812e583dc9ea9af7b');
const superAdmin = Address.parse('EQAcmvznK9RWWsXzVykfgPnhXf3EedQR_pgS5YPcnqmve4Sb');

console.log('Comparison:');
console.log('Your wallet raw:', yourWallet.toRawString());
console.log('Super admin raw:', superAdmin.toRawString());
console.log('Are they equal?', yourWallet.equals(superAdmin));