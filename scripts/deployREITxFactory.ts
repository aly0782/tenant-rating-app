import { toNano, Dictionary, Cell, Address } from '@ton/core';
import { REITxFactory } from '../wrappers/REITxFactory';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    console.log('🚀 Deploying REITx Factory contract...');

    const ui = provider.ui();

    // Get the deployer's address
    const deployerAddress = provider.sender().address;
    if (!deployerAddress) {
        throw new Error('Failed to get deployer address');
    }

    console.log('📍 Deployer address:', deployerAddress.toString());

    // Compile the contract
    console.log('🔨 Compiling contract...');
    const code = await compile('REITxFactory');

    // Create initial config
    const config = {
        adminAddress: deployerAddress,
        nextPropertyId: 0,
        properties: Dictionary.empty<number, Cell>(),
        userBalances: Dictionary.empty<number, Cell>(),
        paused: false
    };

    // Create the contract instance
    const reitxFactory = REITxFactory.createFromConfig(config, code);
    
    console.log('📄 Contract address will be:', reitxFactory.address.toString());
    
    ui.write('⚙️ Preparing deployment to testnet...\n');

    // Deploy the contract
    const opened = provider.open(reitxFactory);
    await opened.sendDeploy(provider.sender(), toNano('0.5'));

    // Wait for deployment
    const deployed = await provider.isContractDeployed(reitxFactory.address);
    if (deployed) {
        console.log('✅ REITx Factory deployed successfully!');
        console.log('📍 Contract address:', reitxFactory.address.toString());
        console.log('🌐 View on explorer: https://testnet.tonscan.org/address/' + reitxFactory.address.toString());
        
        try {
            // Verify contract is working by getting next property ID
            const openContract = provider.open(reitxFactory);
            const nextId = await openContract.getNextPropertyId();
            console.log('🔍 Initial next property ID:', nextId);
            
            const isPaused = await openContract.getIsPaused();
            console.log('⏸️  Contract paused status:', isPaused);
        } catch (error) {
            console.log('⚠️  Could not verify contract state (this is normal for new deployments)');
        }
        
        // Save the contract address for later use
        console.log('\n📋 IMPORTANT: Save this contract address for your dapp configuration:');
        console.log('   ' + reitxFactory.address.toString());
        console.log('\n🔧 Next steps:');
        console.log('   1. Update your dapp config with this address');
        console.log('   2. Fund the contract with some TON for gas');
        console.log('   3. Create test properties using the createTestProperty script');
        
        return reitxFactory;
    } else {
        throw new Error('Contract deployment verification failed');
    }
}