import { useEffect, useState } from 'react';
import { Address, fromNano, toNano } from '@ton/core';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { REITxFactory, PropertyInfo } from '../../../../wrappers/REITxFactory';

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
  const { userAddress } = useTonConnect();
  const [factory, setFactory] = useState<REITxFactory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    try {
      // Use placeholder address for now - in production this would come from config or deployment
      const address = factoryAddress || 'EQDREITxContractAddressPlaceholder';
      if (address === 'EQDREITxContractAddressPlaceholder') {
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

  const getAllProperties = async (): Promise<PropertyInfo[]> => {
    if (!factory || !client) return [];
    
    try {
      const nextPropertyId = await factory.getNextPropertyId(client);
      const properties: PropertyInfo[] = [];
      
      for (let i = 0; i < nextPropertyId; i++) {
        try {
          const propertyInfo = await factory.getPropertyInfo(client, i);
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
      const nextPropertyId = await factory.getNextPropertyId(client);
      const holdings: PropertyHolding[] = [];
      const userAddr = Address.parse(userAddress);
      
      for (let i = 0; i < nextPropertyId; i++) {
        try {
          const userBalance = await factory.getUserBalance(client, i, userAddr);
          
          if (userBalance > 0n) {
            const propertyInfo = await factory.getPropertyInfo(client, i);
            const soldTokens = propertyInfo.totalSupply - propertyInfo.availableTokens;
            const ownershipPercentage = soldTokens > 0n ? 
              Number(userBalance * 10000n / soldTokens) / 100 : 0;
            
            // Calculate user's investment value
            const userInvestment = userBalance * propertyInfo.pricePerToken;
            
            // Assume 2.5% annual appreciation for current value calculation
            const appreciationRate = 1.025;
            const currentValue = userInvestment * BigInt(Math.floor(appreciationRate * 1000000)) / 1000000n;
            
            // Calculate monthly yield based on user's proportion of total rent
            const monthlyYield = soldTokens > 0n ? 
              (propertyInfo.monthlyRent * userBalance) / soldTokens : 0n;
            
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
    if (!factory || !client) {
      throw new Error('Contract not initialized');
    }

    const totalPrice = amount * pricePerToken;
    const value = totalPrice + toNano('0.1'); // Add gas fees

    // This would be called through the TonConnect UI in the actual transaction
    return {
      propertyId,
      amount,
      value,
      totalPrice
    };
  };

  return {
    factory,
    isLoading,
    error,
    getAllProperties,
    getUserHoldings,
    buyTokens
  };
}