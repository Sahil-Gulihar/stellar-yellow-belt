import { useState, useEffect, useCallback } from 'react';
import { 
  server, 
  CONTRACT_ID, 
  TESTNET_DETAILS 
} from '@/lib/stellar';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { 
  TransactionBuilder, 
  Operation, 
  rpc, 
  scValToNative,
  Account
} from '@stellar/stellar-sdk';

export function useCounter(address: string | null) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'fail'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const dummySource = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const simResponse = await server.simulateTransaction(
        new TransactionBuilder(
          new Account(dummySource, "0"),
          { fee: "100", networkPassphrase: TESTNET_DETAILS.networkPassphrase }
        )
        .addOperation(
          Operation.invokeContractFunction({
            contract: CONTRACT_ID,
            function: "get_count",
            args: []
          })
        )
        .setTimeout(30)
        .build()
      );

      if (rpc.Api.isSimulationSuccess(simResponse) && simResponse.result) {
        const val = scValToNative(simResponse.result.retval);
        setCount(Number(val));
      }
    } catch (err) {
      console.error('Failed to fetch count', err);
    }
  }, []);

  const increment = useCallback(async () => {
    if (!address) return;
    
    setTxStatus('pending');
    setError(null);
    
    try {
      const account = await server.getAccount(address);
      const tx = new TransactionBuilder(
        account,
        { 
          fee: "1000",
          networkPassphrase: TESTNET_DETAILS.networkPassphrase 
        }
      )
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: "increment",
          args: []
        })
      )
      .setTimeout(30)
      .build();

      const sim = await server.simulateTransaction(tx);
      if (rpc.Api.isSimulationError(sim)) {
        throw new Error('Simulation failed: ' + sim.error);
      }

      const preparedTx = rpc.assembleTransaction(tx, sim);
      
      const { signedTxXdr } = await StellarWalletsKit.signTransaction((preparedTx as any).toXDR());
      
      const submission = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, TESTNET_DETAILS.networkPassphrase)
      );

      if ((submission as any).status !== 'PENDING') {
        throw new Error('Transaction submission failed');
      }

      let response = await server.getTransaction(submission.hash);
      while ((response as any).status === 'NOT_FOUND' || (response as any).status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await server.getTransaction(submission.hash);
      }

      if ((response as any).status === 'SUCCESS') {
        setTxStatus('success');
        fetchCount();
      } else {
        throw new Error('Transaction failed: ' + (response as any).status);
      }
    } catch (err: any) {
      console.error(err);
      setTxStatus('fail');
      if (err.message?.includes('InsufficientBalance')) {
        setError('Insufficient balance to pay for transaction.');
      } else {
        setError(err.message || 'Transaction failed');
      }
    }
  }, [address, fetchCount]);

  useEffect(() => {
    let interval = setInterval(fetchCount, 5000);
    fetchCount();
    
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, increment, txStatus, error, loading: txStatus === 'pending' };
}
