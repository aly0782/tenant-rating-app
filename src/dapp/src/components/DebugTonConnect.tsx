import React from 'react';
import { Box, Text, Badge, VStack, Button } from '@chakra-ui/react';
import { useTonConnect } from '../hooks/useTonConnect';

export function DebugTonConnect() {
  const { isConnected, userAddress, wallet, chain, connectWallet, disconnectWallet, tonConnectUI } = useTonConnect();

  const testConnection = () => {
    console.log('Testing TonConnect:', {
      tonConnectUI,
      wallets: tonConnectUI?.getWallets?.() || 'Not available',
      isConnected,
      wallet
    });
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Box 
      position="fixed" 
      top="80px" 
      right="16px" 
      bg="white" 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md" 
      p={3} 
      shadow="md" 
      fontSize="sm"
      zIndex="999"
      maxW="300px"
    >
      <VStack align="flex-start" spacing={2}>
        <Text fontWeight="bold">TON Connect Debug</Text>
        <Text>
          Status: <Badge colorScheme={isConnected ? 'green' : 'red'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </Text>
        {wallet && (
          <>
            <Text>Address: {userAddress ? userAddress.slice(0, 8) + '...' + userAddress.slice(-6) : 'N/A'}</Text>
            <Text>Chain: {chain || 'Unknown'}</Text>
            <Text>Wallet: {wallet.device.appName || 'Unknown'}</Text>
          </>
        )}
        <VStack spacing={2} align="stretch">
          <Button size="xs" onClick={connectWallet} disabled={isConnected}>
            Connect
          </Button>
          <Button size="xs" onClick={disconnectWallet} disabled={!isConnected}>
            Disconnect
          </Button>
          <Button size="xs" onClick={testConnection}>
            Test Debug
          </Button>
        </VStack>
        <Text fontSize="xs" color="gray.500">
          Check browser console for detailed logs
        </Text>
      </VStack>
    </Box>
  );
}