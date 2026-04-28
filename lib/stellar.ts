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

export const CONTRACT_ID = "CDLLV7BWI7S2FGKY6UOKBKQC4JWD5W5A4LDAOZDS3XMWWDJZENBGG7GA";

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
