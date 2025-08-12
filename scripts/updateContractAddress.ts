import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Script to update contract address after deployment
export function updateContractAddress(newAddress: string) {
    console.log('🔄 Updating contract address to:', newAddress);
    
    // Update useREITxFactory.ts
    const hookPath = join(__dirname, '../src/dapp/src/hooks/useREITxFactory.ts');
    let hookContent = readFileSync(hookPath, 'utf8');
    
    // Replace the current address with the new one
    const addressRegex = /const address = factoryAddress \|\| '[^']+';/;
    const newLine = `const address = factoryAddress || '${newAddress}';`;
    hookContent = hookContent.replace(addressRegex, newLine);
    
    writeFileSync(hookPath, hookContent);
    console.log('✅ Updated useREITxFactory.ts');
    
    // Update production config
    const configPath = join(__dirname, '../src/dapp/src/config/production.ts');
    let configContent = readFileSync(configPath, 'utf8');
    
    const configRegex = /reitxFactory: '[^']+'/;
    const newConfigLine = `reitxFactory: '${newAddress}'`;
    configContent = configContent.replace(configRegex, newConfigLine);
    
    writeFileSync(configPath, configContent);
    console.log('✅ Updated production.ts config');
    
    console.log('✅ Contract address update complete!');
    console.log('🚀 You can now build and deploy your frontend');
}

// If run directly
if (require.main === module) {
    const address = process.argv[2];
    if (!address) {
        console.error('❌ Please provide contract address as argument');
        console.log('Usage: yarn ts-node scripts/updateContractAddress.ts <CONTRACT_ADDRESS>');
        process.exit(1);
    }
    updateContractAddress(address);
}