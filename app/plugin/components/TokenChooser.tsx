import * as React from "react";
import { usePayment } from "../hooks";
import TestnetActions from "./TestnetActions";
import TokenItem from "./TokenItem";
import {
  classnames,
  alignItems,
  display,
  spacing,
  borders,
} from "tailwindcss-classnames";
import { useSigner } from "wagmi";
import type { TokenInfo } from "@hiropay/tokenlists";

export default function TokenChooser({
  chain,
  setToken,
}: {
  chain: any;
  setToken: any;
}) {
  const { invoice } = usePayment();

  const { data: signer } = useSigner();

  const tokens = invoice.coins.filter((token: { chainId: any }) => {
    return token.chainId == chain.chainId;
  });

  return (
    <>
      <div className="overflow-hidden bg-white pt-2">
        <div
          className={classnames(
            display("flex"),
            alignItems("items-center"),
            spacing("px-0", "py-3", "sm:px-6"),
            borders("border-b", "border-gray-400")
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
          {tokens.map((token: TokenInfo) => (
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
      {false && chain.testnet && (
        <TestnetActions tokens={tokens} provider={signer?.provider} />
      )}
    </>
  );
}
