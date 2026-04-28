import { 
  StellarWalletsKit, 
  WalletNetwork, 
  AllowAllModules,
  SupportedWallet
} from '@creit.tech/stellar-wallets-kit';
import { 
  Asset, 
  Keypair, 
  Network, 
  Operation, 
  TransactionBuilder, 
  rpc,
  xdr,
  Address
} from '@stellar/stellar-sdk';

export const TESTNET_DETAILS = {
  network: WalletNetwork.TESTNET,
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
};

export const CONTRACT_ID = "CBEOJUP5FU6KKOEZ7RMTSKZ7YLBS5D6LVATIGCESOGXSZEQ2UWQFKZW6";

export const kit = new StellarWalletsKit({
  network: TESTNET_DETAILS.network,
  modules: AllowAllModules,
});

export const server = new rpc.Server(TESTNET_DETAILS.rpcUrl);

export async function getCount() {
  const contract = new Address(CONTRACT_ID);
  
  // Create a dummy source account for the simulation
  const source = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
  
  const simResponse = await server.simulateTransaction(
    new TransactionBuilder(
      new rpc.Account(source, "0"),
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
    const result = simResponse.result.retval;
    // Parse the ScVal result to a number
    // This is a simplified version; real parsing depends on ScVal type
    // For a counter, it's usually a u32
    return result.u32() || 0;
  }
  return 0;
}
