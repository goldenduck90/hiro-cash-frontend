import * as React from "react";
import { usePayment } from "../hooks";
import TestnetActions from "./TestnetActions";
import TokenItem from "./TokenItem";
import { supportedTokensOfWallet } from "~/helpers";
import { tokenlist } from "@hiropay/tokenlists";
import { useSigner } from "wagmi";

export default function TokenChooser({ chain, setToken }) {
  const { invoice } = usePayment();

  const { data: signer } = useSigner();

  const tokens = invoice.coins.filter((token) => {
    return token.chainId == chain.chainId;
  });

  return (
    <>
      <div className="overflow-hidden bg-white pt-2">
        <ul className="divide-y divide-blue-300">
          {tokens.map((token) => (
            <TokenItem
              key={token.address}
              invoice={invoice}
              tokenInfo={token}
              setToken={setToken}
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
