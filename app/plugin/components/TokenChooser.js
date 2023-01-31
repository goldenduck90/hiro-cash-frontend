import * as React from "react";
import TestnetActions from "./TestnetActions";
import TokenItem from "./TokenItem";
import { usePayment } from "../hooks";

export default function TokenChooser() {
  const { state } = usePayment();

  const { chain, balances, signer, invoice } = state.context;
  const { tokens } = chain;

  // This should really happen before loading balances
  const filteredBalances = balances.filter((b) => {
    return invoice.coins.includes(b.tokenInfo);
  });

  return (
    <>
      <div className="overflow-hidden bg-white pt-2">
        <ul role="list" className="divide-y divide-blue-300">
          {filteredBalances.map((balance) => (
            <TokenItem
              key={balance.tokenInfo.address}
              balance={balance}
              tokenInfo={balance.tokenInfo}
              amountInMinor={invoice.amountInMinor}
            />
          ))}
        </ul>
      </div>
      {chain.testnet && (
        <TestnetActions tokens={tokens} provider={signer.provider} />
      )}
    </>
  );
}
