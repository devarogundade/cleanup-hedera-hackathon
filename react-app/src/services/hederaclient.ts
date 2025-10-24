import { AccountId, Client, Hbar, PrivateKey } from "@hashgraph/sdk";

export const testnetClient = (): Client => {
  // For test network (testnet)
  const client = Client.forTestnet();

  client.setOperator(
    AccountId.fromString(import.meta.env.VITE_OPERATOR_ACCOUNT_ID),
    PrivateKey.fromStringECDSA(import.meta.env.VITE_OPERATOR_ACCOUNT_PK)
  );

  //Set the default maximum transaction fee (in Hbar)
  client.setDefaultMaxTransactionFee(new Hbar(10));

  //Set the maximum payment for queries (in Hbar)
  client.setDefaultMaxQueryPayment(new Hbar(5));

  return client;
};
