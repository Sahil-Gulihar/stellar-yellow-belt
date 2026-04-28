"use client";

import { useWallet } from "@/hooks/useWallet";
import { useCounter } from "@/hooks/useCounter";
import { CONTRACT_ID, initStellarKit } from "@/lib/stellar";
import { useEffect } from "react";

export default function CounterApp() {
  useEffect(() => {
    initStellarKit();
  }, []);

  const { address, error: walletError, loading: walletLoading, connect, disconnect } = useWallet();
  const { count, increment, txStatus, error: txError, loading: txLoading } = useCounter(address);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <main className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Soroban Live Counter
          </h1>
          <p className="text-neutral-400 text-lg">
            Yellow Belt Level: Multi-wallet integration, real-time events, and contract interaction.
          </p>
        </section>

        {/* Wallet Connection */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Wallet</h2>
            {address ? (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium uppercase tracking-wider">
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded-full text-xs font-medium uppercase tracking-wider">
                Disconnected
              </span>
            )}
          </div>

          {!address ? (
            <button
              onClick={connect}
              disabled={walletLoading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {walletLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 break-all font-mono text-sm text-neutral-400">
                {address}
              </div>
              <button
                onClick={disconnect}
                className="w-full py-2 bg-neutral-800 text-neutral-300 font-medium rounded-xl hover:bg-neutral-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}

          {walletError && (
            <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              Error: {walletError}
            </p>
          )}
        </div>

        {/* Contract Interaction */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Contract Stats</h2>
            <p className="text-xs text-neutral-500 font-mono truncate">
              ID: {CONTRACT_ID}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12 bg-neutral-950 rounded-2xl border border-neutral-800 shadow-inner">
            <span className="text-neutral-500 text-sm uppercase tracking-widest mb-2 font-medium">Current Count</span>
            <span className="text-7xl font-black text-white">
              {count !== null ? count : "--"}
            </span>
          </div>

          <div className="space-y-4">
            <button
              onClick={increment}
              disabled={!address || txLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] ${
                !address 
                  ? "bg-neutral-800 text-neutral-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/20 hover:from-blue-500 hover:to-blue-400"
              }`}
            >
              {txLoading ? "Transaction Pending..." : "Increment Counter"}
            </button>

            {/* Transaction Status UI */}
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  txStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 
                  txStatus === 'success' ? 'bg-emerald-500' : 
                  txStatus === 'fail' ? 'bg-red-500' : 'bg-neutral-700'
                }`} />
                <span className="text-sm text-neutral-400 capitalize">
                  Status: {txStatus}
                </span>
              </div>
              
              {txStatus === 'success' && (
                <span className="text-xs text-emerald-400 font-medium animate-in fade-in slide-in-from-right-4">
                  Count Updated!
                </span>
              )}
            </div>

            {txError && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                {txError}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-neutral-600 text-sm pb-12">
          <p>Built for Stellar Yellow Belt • Testnet</p>
        </footer>
      </main>
    </div>
  );
}
