import { useState, useCallback } from 'react';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // New API uses authModal
      await StellarWalletsKit.authModal({});

      const { address } = await StellarWalletsKit.getAddress();
      setAddress(address);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('not found')) {
        setError('Wallet extension not found. Please install it.');
      } else if (err.message?.includes('User rejected')) {
        setError('Connection request rejected by user.');
      } else {
        setError('Failed to connect: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    setAddress(null);
    setError(null);
  }, []);

  return { address, error, loading, connect, disconnect };
}
