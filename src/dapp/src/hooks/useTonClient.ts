import { TonClient } from '@ton/ton';
import { useAsyncInitialize } from './useAsyncInitialize';

export function useTonClient() {
  const client = useAsyncInitialize(
    async () =>
      new TonClient({
        // Use direct TON Center API to avoid rate limiting from Orbs
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
      })
  );

  return {
    client,
  };
}