import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    SendMode,
    toNano,
    Dictionary
} from '@ton/core';

export type REITxFactoryConfig = {
    adminAddress: Address;
    nextPropertyId: number;
    properties: Dictionary<number, Cell>;
    userBalances: Dictionary<number, Cell>;
    paused: boolean;
};

export type PropertyInfo = {
    name: string;
    location: string;
    totalSupply: bigint;
    pricePerToken: bigint;
    monthlyRent: bigint;
    active: boolean;
    uri: string;
    availableTokens: bigint;
};

export function REITxFactoryConfigToCell(config: REITxFactoryConfig): Cell {
    return beginCell()
        .storeAddress(config.adminAddress)
        .storeUint(config.nextPropertyId, 32)
        .storeDict(config.properties)
        .storeDict(config.userBalances)
        .storeBit(config.paused)
        .endCell();
}

export class REITxFactory implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new REITxFactory(address);
    }

    static createFromConfig(config: REITxFactoryConfig, code: Cell, workchain = 0) {
        const data = REITxFactoryConfigToCell(config);
        const init = { code, data };
        return new REITxFactory(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCreateProperty(
        provider: ContractProvider,
        via: Sender,
        opts: {
            name: string;
            location: string;
            totalSupply: bigint;
            pricePerToken: bigint;
            monthlyRent: bigint;
            uri: string;
            queryId?: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.1'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x12345678, 32) // op::create_property
                .storeUint(opts.queryId ?? 0, 64)
                .storeRef(beginCell().storeStringTail(opts.name).endCell())
                .storeRef(beginCell().storeStringTail(opts.location).endCell())
                .storeCoins(opts.totalSupply)
                .storeCoins(opts.pricePerToken)
                .storeCoins(opts.monthlyRent)
                .storeRef(beginCell().storeStringTail(opts.uri).endCell())
                .endCell(),
        });
    }

    async sendBuyTokens(
        provider: ContractProvider,
        via: Sender,
        opts: {
            propertyId: number;
            amount: bigint;
            value: bigint;
            queryId?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x87654321, 32) // op::buy_tokens
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.propertyId, 32)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    async sendSetPropertyActive(
        provider: ContractProvider,
        via: Sender,
        opts: {
            propertyId: number;
            active: boolean;
            queryId?: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x11223344, 32) // op::set_property_active
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.propertyId, 32)
                .storeBit(opts.active)
                .endCell(),
        });
    }

    async sendUpdatePropertyUri(
        provider: ContractProvider,
        via: Sender,
        opts: {
            propertyId: number;
            uri: string;
            queryId?: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x44332211, 32) // op::update_property_uri
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.propertyId, 32)
                .storeRef(beginCell().storeStringTail(opts.uri).endCell())
                .endCell(),
        });
    }

    async sendPause(provider: ContractProvider, via: Sender, queryId?: number) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x55667788, 32) // op::pause
                .storeUint(queryId ?? 0, 64)
                .endCell(),
        });
    }

    async sendUnpause(provider: ContractProvider, via: Sender, queryId?: number) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x88776655, 32) // op::unpause
                .storeUint(queryId ?? 0, 64)
                .endCell(),
        });
    }

    async sendWithdrawFunds(provider: ContractProvider, via: Sender, queryId?: number) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x99887766, 32) // op::withdraw_funds
                .storeUint(queryId ?? 0, 64)
                .endCell(),
        });
    }

    async sendDistributeRent(
        provider: ContractProvider,
        via: Sender,
        opts: {
            propertyId: number;
            rentAmount: bigint;
            queryId?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.rentAmount + toNano('0.1'), // Include rent amount + fees
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xaabbccdd, 32) // op::distribute_rent
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.propertyId, 32)
                .storeCoins(opts.rentAmount)
                .endCell(),
        });
    }

    async getPropertyInfo(provider: ContractProvider, propertyId: number): Promise<PropertyInfo> {
        const result = await provider.get('get_property_info', [
            { type: 'int', value: BigInt(propertyId) }
        ]);
        
        const stack = result.stack;
        stack.readNumber(); // property_id
        const nameCell = stack.readCell();
        const locationCell = stack.readCell();
        const totalSupply = stack.readBigNumber();
        const pricePerToken = stack.readBigNumber();
        const monthlyRent = stack.readBigNumber();
        const active = stack.readNumber() === 1;
        const uriCell = stack.readCell();
        const availableTokens = stack.readBigNumber();

        return {
            name: nameCell.beginParse().loadStringTail(),
            location: locationCell.beginParse().loadStringTail(),
            totalSupply,
            pricePerToken,
            monthlyRent,
            active,
            uri: uriCell.beginParse().loadStringTail(),
            availableTokens
        };
    }

    async getNextPropertyId(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_next_property_id', []);
        return result.stack.readNumber();
    }

    async getIsPaused(provider: ContractProvider): Promise<boolean> {
        const result = await provider.get('is_paused', []);
        return result.stack.readNumber() === 1;
    }

    async getUserBalance(provider: ContractProvider, propertyId: number, userAddress: Address): Promise<bigint> {
        const result = await provider.get('get_user_balance', [
            { type: 'int', value: BigInt(propertyId) },
            { type: 'slice', cell: beginCell().storeAddress(userAddress).endCell() }
        ]);
        return result.stack.readBigNumber();
    }

    async getPropertyHolders(provider: ContractProvider, propertyId: number): Promise<Array<{address: Address, balance: bigint}>> {
        // Note: This would need to be implemented in the smart contract
        // For now, returning empty array - in production, this would fetch from contract
        return [];
    }
}