import * as React from "react";
import { usePayment } from "../hooks";
import TestnetActions from "./TestnetActions";
import TokenItem from "./TokenItem";
import { supportedTokensOfWallet } from "~/helpers";
import { tokenlist } from "@hiropay/tokenlists";
import { classnames } from "tailwindcss-classnames";
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
        <div
          className={classnames(
            "flex",
            "items-center",
            "px-0",
            "py-3",
            "sm:px-6",
            "border-b",
            "border-gray-400"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center">
            <p className="text-md truncate pt-0 font-medium text-slate-600">
              Token
            </p>
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 px-4">
              <div></div>
              <div className="">
                <div className="text-md truncate pt-0 text-right font-medium text-slate-600">
                  Balance
                </div>
              </div>
            </div>
          </div>
        </div>

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
