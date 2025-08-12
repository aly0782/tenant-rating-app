import { useEffect, useState } from 'react';
import { Address, fromNano, toNano, beginCell, Sender } from '@ton/core';
import { Buffer } from 'buffer';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { REITxFactory, PropertyInfo } from '../wrappers/REITxFactory';
import { TonClient } from '@ton/ton';
import contractConfig from '../config/contract.json';

interface PropertyHolding {
  propertyId: number;
  propertyInfo: PropertyInfo;
  userBalance: bigint;
  userInvestment: bigint;
  currentValue: bigint;
  monthlyYield: bigint;
  totalReturns: bigint;
  ownershipPercentage: number;
}

export function useREITxFactory(factoryAddress?: string) {
  const { client } = useTonClient();
  const { userAddress, sendTransaction, tonConnectUI } = useTonConnect();
  const [factory, setFactory] = useState<REITxFactory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    try {
      // Use contract address from configuration
      const address = factoryAddress || contractConfig.factoryAddress || 'EQB-OAFqUknskjjg0sTw7Jb8ubjxipwsLZBPiUxkHzEY1LPL';
      if (!address || address === 'EQDREITxContractAddressPlaceholder') {
        setError('Contract not deployed yet. Please deploy the REITx Factory contract first.');
        setIsLoading(false);
        return;
      }
      
      const factoryInstance = REITxFactory.createFromAddress(Address.parse(address));
      setFactory(factoryInstance);
    } catch (err) {
      setError('Failed to initialize contract: ' + (err as Error).message);
    }
    
    setIsLoading(false);
  }, [client, factoryAddress]);

  // Mock properties for testing when contract is not ready
  const getMockProperties = (): PropertyInfo[] => {
    return [
      {
        id: 0,
        name: 'Luxury Patuá Apartment',
        location: 'Patuá, Lisbon',
        totalSupply: toNano('1000000'),
        pricePerToken: toNano('0.005'),
        monthlyRent: toNano('50'),
        active: true,
        uri: 'https://gateway.pinata.cloud/ipfs/QmVkzko97VTRhWdDCLA24AWPtoj6tbi8Ssa2QyoVbZM4pD',
        availableTokens: toNano('900000'),
        images: ['/patua-pictures/patua1.jpg', '/patua-pictures/patua2.jpg']
      } as any,
      {
        id: 1,
        name: 'Four Seasons Residence',
        location: 'Rua Castilho, Lisbon',
        totalSupply: toNano('2000000'),
        pricePerToken: toNano('0.01'),
        monthlyRent: toNano('100'),
        active: true,
        uri: 'https://demo.reitx.com/four-seasons',
        availableTokens: toNano('1500000'),
        images: ['/four-seasons-pictures/fs1.jpg', '/four-seasons-pictures/fs2.jpg']
      } as any,
      {
        id: 2,
        name: 'Barbadinhos Premium',
        location: 'Rua Barbadinhos, Porto',
        totalSupply: toNano('500000'),
        pricePerToken: toNano('0.002'),
        monthlyRent: toNano('25'),
        active: true,
        uri: 'https://demo.reitx.com/barbadinhos',
        availableTokens: toNano('450000'),
        images: ['/rua-barbadinhos-pictures/rb1.jpg', '/rua-barbadinhos-pictures/rb2.jpg']
      } as any
    ];
  };

  const getAllProperties = async (): Promise<PropertyInfo[]> => {
    if (!factory || !client) return [];
    
    try {
      const provider = (client as TonClient).provider(factory.address);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let nextPropertyId = 0;
      try {
        nextPropertyId = await factory.getNextPropertyId(provider as any);
      } catch (err: any) {
        console.error('Could not get next property ID:', err.message);
        // Return mock properties for demo when contract is not working
        return getMockProperties();
      }
      
      const properties: PropertyInfo[] = [];
      
      // Limit to max 10 properties for now to avoid rate limiting
      const maxProperties = Math.min(nextPropertyId, 10);
      
      for (let i = 0; i < maxProperties; i++) {
        try {
          // Add delay between requests to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          const propertyInfo = await factory.getPropertyInfo(provider as any, i);
          properties.push({ ...propertyInfo, id: i } as PropertyInfo & { id: number });
        } catch (err) {
          // Property might not exist, skip it
          console.warn(`Property ${i} not found:`, err);
        }
      }
      
      return properties;
    } catch (err) {
      console.error('Failed to get properties:', err);
      return [];
    }
  };

  const getUserHoldings = async (): Promise<PropertyHolding[]> => {
    if (!factory || !client || !userAddress) return [];
    
    try {
      const provider = (client as TonClient).provider(factory.address);
      const nextPropertyId = await factory.getNextPropertyId(provider as any);
      const holdings: PropertyHolding[] = [];
      const userAddr = Address.parse(userAddress);
      
      for (let i = 0; i < nextPropertyId; i++) {
        try {
          const userBalance = await factory.getUserBalance(provider as any, i, userAddr);
          
          if (userBalance > 0n) {
            const propertyInfo = await factory.getPropertyInfo(provider as any, i);
            const soldTokens = propertyInfo.totalSupply - propertyInfo.availableTokens;
            const ownershipPercentage = soldTokens > 0n
              ? Number((userBalance * 10000n) / soldTokens) / 100
              : 0;
            
            // Calculate user's investment value
            const userInvestment = userBalance * propertyInfo.pricePerToken;
            
            // Assume 2.5% annual appreciation for current value calculation
            const appreciationMultiplier = 1_025_000n; // 1.025 * 1e6
            const currentValue = (userInvestment * appreciationMultiplier) / 1_000_000n;
            
            // Calculate monthly yield based on user's proportion of total rent
            const monthlyYield = soldTokens > 0n
              ? (propertyInfo.monthlyRent * userBalance) / soldTokens
              : 0n;
            
            // Mock total returns - in production, this would come from a dividend tracking contract
            const totalReturns = monthlyYield * 6n; // Assume 6 months of returns
            
            holdings.push({
              propertyId: i,
              propertyInfo,
              userBalance,
              userInvestment,
              currentValue,
              monthlyYield,
              totalReturns,
              ownershipPercentage
            });
          }
        } catch (err) {
          console.warn(`Failed to get user balance for property ${i}:`, err);
        }
      }
      
      return holdings;
    } catch (err) {
      console.error('Failed to get user holdings:', err);
      return [];
    }
  };

  const buyTokens = async (propertyId: number, amount: bigint, pricePerToken: bigint) => {
    if (!factory || !client || !tonConnectUI) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    const totalPrice = amount * pricePerToken;
    const value = totalPrice + toNano('0.1'); // Add gas fees

    const message = beginCell()
      .storeUint(0x87654321, 32) // op::buy_tokens
      .storeUint(0, 64) // query_id
      .storeUint(propertyId, 32)
      .storeCoins(amount)
      .endCell();

    await sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
      messages: [
        {
          address: contractConfig.factoryAddress,
          amount: value.toString(),
          payload: message.toBoc().toString('base64')
        }
      ]
    });

    return {
      propertyId,
      amount,
      value,
      totalPrice
    };
  };

  // Admin methods
  const createProperty = async (property: {
    name: string;
    location: string;
    totalSupply: bigint;
    pricePerToken: bigint;
    monthlyRent: bigint;
    uri: string;
  }) => {
    if (!tonConnectUI || !factory) {
      throw new Error('Wallet not connected or factory not loaded');
    }

    console.log('Creating property with:', {
      name: property.name,
      location: property.location,
      totalSupply: property.totalSupply.toString(),
      pricePerToken: property.pricePerToken.toString(),
      monthlyRent: property.monthlyRent.toString(),
      uri: property.uri,
      contractAddress: contractConfig.factoryAddress
    });

    const message = beginCell()
      .storeUint(0x12345678, 32) // op::create_property
      .storeUint(0, 64) // query_id
      .storeRef(beginCell().storeBuffer(Buffer.from(property.name)).endCell())
      .storeRef(beginCell().storeBuffer(Buffer.from(property.location)).endCell())
      .storeCoins(property.totalSupply)
      .storeCoins(property.pricePerToken)
      .storeCoins(property.monthlyRent)
      .storeRef(beginCell().storeBuffer(Buffer.from(property.uri)).endCell())
      .endCell();

    console.log('Message payload:', message.toBoc().toString('base64'));

    try {
      const result = await sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: contractConfig.factoryAddress,
            amount: toNano('0.5').toString(), // Increased gas to 0.5 TON
            payload: message.toBoc().toString('base64')
          }
        ]
      });
      console.log('Transaction result:', result);
      
      // Wait a bit for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if property was actually created
      try {
        const provider = (client as TonClient).provider(factory.address);
        const newPropertyId = await factory.getNextPropertyId(provider as any);
        console.log('New property ID after transaction:', newPropertyId);
      } catch (err) {
        console.error('Failed to check new property ID:', err);
      }
      
      return true;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const getPropertyHolders = async (propertyId: number): Promise<Array<{
    address: string;
    balance: bigint;
    percentage: number;
  }>> => {
    if (!factory || !client) return [];
    
    try {
      const provider = (client as TonClient).provider(factory.address);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get property info to calculate percentages
      const propertyInfo = await factory.getPropertyInfo(provider as any, propertyId);
      const soldTokens = propertyInfo.totalSupply - propertyInfo.availableTokens;
      
      // Get holders from contract (in production)
      // For testing, we'll create mock data
      const holders = await factory.getPropertyHolders(provider as any, propertyId);
      
      // Calculate percentages
      return holders.map((holder: {address: Address, balance: bigint}) => ({
        address: holder.address.toString(),
        balance: holder.balance,
        percentage: soldTokens > 0n ? Number((holder.balance * 10000n) / soldTokens) / 100 : 0
      }));
    } catch (err) {
      console.error('Failed to get property holders:', err);
      return [];
    }
  };

  return {
    factory,
    isLoading: isLoading,
    error: error,
    getAllProperties,
    getUserHoldings,
    getPropertyHolders,
    buyTokens,
    createProperty
  };
}