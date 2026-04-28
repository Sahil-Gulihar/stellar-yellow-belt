import { useState, useEffect, useCallback } from 'react';
import { kit, TESTNET_DETAILS } from '@/lib/stellar';
import { SupportedWallet } from '@creit.tech/stellar-wallets-kit';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Requirements: Multi-wallet integration
      // kit.openModal() handles the selection UI
      const { address } = await kit.openModal({
        onClosed: (error) => {
          if (error) setError('Wallet selection cancelled');
        },
        modalTitle: 'Connect your Stellar Wallet',
        allowedWallets: [
          SupportedWallet.FREIGHTER,
          SupportedWallet.ALBEDO,
          SupportedWallet.XBULL,
          SupportedWallet.HANA,
        ],
      });

      setAddress(address);
    } catch (err: any) {
      console.error(err);
      // Requirements: Error handling (3 types)
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

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return { address, error, loading, connect, disconnect };
}
