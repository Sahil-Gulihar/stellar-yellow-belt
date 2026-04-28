import { 
  StellarWalletsKit, 
  Networks 
} from '@creit.tech/stellar-wallets-kit';
import { 
  defaultModules 
} from '@creit.tech/stellar-wallets-kit/modules/utils';
import { 
  Operation, 
  TransactionBuilder, 
  rpc,
  Account
} from '@stellar/stellar-sdk';

export const TESTNET_DETAILS = {
  network: Networks.TESTNET,
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
};

export const CONTRACT_ID = "CBEOJUP5FU6KKOEZ7RMTSKZ7YLBS5D6LVATIGCESOGXSZEQ2UWQFKZW6";

// Function to initialize the kit only on client side
export function initStellarKit() {
  if (typeof window !== 'undefined') {
    StellarWalletsKit.init({
      network: TESTNET_DETAILS.network as any,
      modules: defaultModules(),
    });
  }
}

export const server = new rpc.Server(TESTNET_DETAILS.rpcUrl);
