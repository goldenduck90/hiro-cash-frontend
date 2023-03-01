import type { TokenInfo } from "@hiropay/tokenlists";
import { getChain } from "@hiropay/tokenlists";
import { useEffect } from "react";
import { useAccount, useSwitchNetwork, useNetwork } from "wagmi";
import { tokensOfChain } from "~/plugin/utils";

import { CHAINS } from "~/plugin/constants/Chains";
import { usePayment } from "../hooks";

export default function ChainDialog({ setChain }: { setChain: any }) {
  const { invoice } = usePayment();
  const { connector } = useAccount();
  const { chain } = useNetwork();
  const currentChain = chain;

  const { switchNetwork } = useSwitchNetwork({
    onSuccess(chain) {
      console.log("switchNetwork", chain);
      setChain(getChain(chain.id));
      // send({ type: "SELECT_CHAIN", chainId: chain.id });
    },
    onMutate(data) {
      console.log("onMutate", data);
      console.log("currentChain", currentChain);
      if (currentChain?.id == data.chainId) {
        // If you select the currently selected chain, onSuccess would otherwise not be called.
        setChain(getChain(data.chainId));
        // send({ type: "SELECT_CHAIN", chainId: data.chainId });
      }
    },
    onSettled(data) {
      console.log("onSettled", data);
    },
    onError(error) {
      console.log("Error", error);
    },
    throwForSwitchChainNotSupported: true,
  });

  const chainIds = invoice.coins.map(
    (tokenInfo: TokenInfo) => tokenInfo.chainId
  );
  const availableChains = CHAINS.filter((chain) => {
    return chainIds.includes(chain.chainId);
  });

  // If wallet provider is wallet connect, we have to pick the chain
  // that is pre-selected by wallet connect.
  // This needs to be handled better/more consistently, e.g. using useConnect({chainId: 1})
  useEffect(() => {
    // Run! Like go get some data from an API.
    if (connector?.id === "walletConnect" && currentChain) {
      switchNetwork!(currentChain.id);
    }
  }, [connector?.id, switchNetwork, currentChain]);

  if (connector?.id === "walletConnect") return null;

  // STATE: SELECT BLOCKCHAIN
  return (
    <>
      <div className="overflow-hidden pt-2 sm:rounded-md">
        <ul className="divide-y divide-slate-900">
          {availableChains.map((chain) => (
            <li
              key={chain.chainId}
              onClick={(e) => {
                e.preventDefault();
                switchNetwork!(chain.chainId);
              }}
              className="block hover:cursor-pointer hover:bg-slate-700/25"
            >
              <div className="flex items-center px-0 py-3 sm:px-4">
                <div className="w-10 flex-none">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={chain.logoUri}
                    alt="Logo"
                  />
                </div>
                <div className="min-w-0 px-4 md:grid md:grid-cols-2 md:gap-4">
                  <p className="truncate text-sm font-medium text-indigo-100">
                    {chain.chainName}
                  </p>
                  <div className="mt-4 hidden text-right sm:mt-0 sm:ml-5">
                    <div className="flex flex-row-reverse -space-x-1 overflow-hidden">
                      {tokensOfChain(invoice.coins, chain.chainId).map(
                        (token) => (
                          <img
                            key={token.address}
                            className="inline-block h-8 w-8"
                            src={token.logoUri}
                            alt={token.name}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
