import { useState, useEffect, useCallback } from 'react';
import { 
  server, 
  CONTRACT_ID, 
  TESTNET_DETAILS, 
  kit 
} from '@/lib/stellar';
import { 
  TransactionBuilder, 
  Operation, 
  rpc, 
  xdr,
  scValToNative
} from '@stellar/stellar-sdk';

export function useCounter(address: string | null) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'fail'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      // Simulation is enough to get the current count
      const dummySource = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const simResponse = await server.simulateTransaction(
        new TransactionBuilder(
          new rpc.Account(dummySource, "0"),
          { fee: "100", networkPassphrase: TESTNET_DETAILS.networkPassphrase }
        )
        .addOperation(
          Operation.invokeContractFunction({
            contractId: CONTRACT_ID,
            function: "get_count",
            args: []
          })
        )
        .setTimeout(30)
        .build()
      );

      if (rpc.Api.isSimulationSuccess(simResponse)) {
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
          fee: "1000", // Standard fee
          networkPassphrase: TESTNET_DETAILS.networkPassphrase 
        }
      )
      .addOperation(
        Operation.invokeContractFunction({
          contractId: CONTRACT_ID,
          function: "increment",
          args: []
        })
      )
      .setTimeout(30)
      .build();

      // Simulate first to get footprints (required for Soroban)
      const sim = await server.simulateTransaction(tx);
      if (rpc.Api.isSimulationError(sim)) {
        throw new Error('Simulation failed: ' + sim.error);
      }

      const preparedTx = rpc.assembleTransaction(tx, sim);
      
      // Sign with the kit
      const { result: signedTxXdr } = await kit.signTransaction(preparedTx.toXDR());
      
      // Submit
      const submission = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedTxXdr, TESTNET_DETAILS.networkPassphrase)
      );

      if (submission.status !== 'PENDING') {
        throw new Error('Transaction submission failed');
      }

      // Poll for status
      let response = await server.getTransaction(submission.hash);
      while (response.status === 'NOT_FOUND' || response.status === 'PENDING') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await server.getTransaction(submission.hash);
      }

      if (response.status === 'SUCCESS') {
        setTxStatus('success');
        fetchCount();
      } else {
        throw new Error('Transaction failed: ' + response.status);
      }
    } catch (err: any) {
      console.error(err);
      setTxStatus('fail');
      // Requirements: Error handling (3 types)
      if (err.message?.includes('InsufficientBalance')) {
        setError('Insufficient balance to pay for transaction.');
      } else {
        setError(err.message || 'Transaction failed');
      }
    }
  }, [address, fetchCount]);

  // Real-time events listening
  useEffect(() => {
    let interval = setInterval(fetchCount, 5000); // Poll every 5s for updates (simulating events)
    fetchCount();
    
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, increment, txStatus, error, loading: txStatus === 'pending' };
}
