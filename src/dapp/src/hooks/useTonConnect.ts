import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  useEffect(() => {
    // Set up TonConnect UI options for better wallet compatibility
    tonConnectUI.uiOptions = {
      twaReturnUrl: 'https://t.me/REITxBot',
      language: 'en',
    };

    // Restore connection if available and log status
    tonConnectUI.connectionRestored.then(() => {
      console.log('TON Connect connection status:', {
        connected: !!wallet,
        wallet: wallet?.device?.appName || 'None',
        address: wallet?.account?.address || 'None'
      });
    }).catch(error => {
      console.error('TON Connect restoration failed:', error);
    });

    // Add connection status listeners
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      console.log('TON Connect status changed:', {
        connected: !!wallet,
        wallet: wallet?.device?.appName || 'None',
        address: wallet?.account?.address || 'None'
      });
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  const connectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...');
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const sendTransaction = async (transaction: any) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction sent:', result);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return {
    wallet,
    isConnected: !!wallet,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    tonConnectUI,
    userAddress: wallet?.account.address || null,
    chain: wallet?.account.chain || null,
  };
}