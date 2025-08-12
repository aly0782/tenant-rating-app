import { toNano, Address, Cell, beginCell, contractAddress, Contract, ContractProvider, Sender, SendMode } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';

// Simple contract class for deployment
class REITxFactoryMultiAdmin implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromConfig(code: Cell, data: Cell, workchain = 0) {
        const init = { code, data };
        return new REITxFactoryMultiAdmin(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}

export async function run(provider: NetworkProvider) {
    // Compile the multi-admin contract
    const code = await compile('REITxFactoryMultiAdmin');
    
    // Get deployer wallet address (will be super admin)
    const deployer = provider.sender().address;
    if (!deployer) {
        throw new Error('Deployer address not available');
    }
    
    console.log('Deploying REITx Factory with Multi-Admin support...');
    console.log('Super Admin will be:', deployer.toString());
    
    // Create initial data
    const data = beginCell()
        .storeAddress(deployer)      // super_admin
        .storeDict(null)             // admins (empty initially)
        .storeUint(0, 32)            // next_property_id
        .storeDict(null)             // properties (empty)
        .storeUint(0, 1)             // paused (false)
        .storeCoins(0)               // total_funds_raised
        .storeCoins(0)               // total_rent_distributed
        .endCell();
    
    // Create and deploy the contract
    const factory = provider.open(
        REITxFactoryMultiAdmin.createFromConfig(code, data)
    );
    
    await factory.sendDeploy(provider.sender(), toNano('0.05'));
    
    await provider.waitForDeploy(factory.address);
    
    console.log('✅ REITx Multi-Admin Factory deployed successfully!');
    console.log('Contract address:', factory.address.toString());
    console.log('');
    console.log('Next steps:');
    console.log('1. Update the contract address in your dApp configuration');
    console.log('2. Add additional admins using the admin panel');
    console.log('3. Create your first property through the admin panel');
    
    // Save contract address to a config file
    const fs = require('fs');
    const configPath = './src/dapp/src/config/contract.json';
    const config = {
        factoryAddress: factory.address.toString(),
        network: provider.network(),
        deployedAt: new Date().toISOString(),
        superAdmin: deployer.toString(),
        features: {
            multiAdmin: true,
            rentDistribution: true,
            pausable: true,
            tokenSales: true
        }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('');
    console.log('Contract configuration saved to:', configPath);
}

export default run;