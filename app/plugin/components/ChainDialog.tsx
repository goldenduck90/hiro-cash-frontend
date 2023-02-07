import type { TokenInfo } from "@hiropay/tokenlists";
import * as React from "react";
import { useAccount, useSwitchNetwork, useNetwork } from "wagmi";

import { CHAINS } from "~/plugin/constants/Chains";
import { usePayment } from "~/plugin/hooks";

export default function ChainDialog() {
  const { send, state } = usePayment();
  const { connector } = useAccount();
  const { chain } = useNetwork();

  const { switchNetwork, isLoading } = useSwitchNetwork({
    onSuccess(chain) {
      console.log("switchNetwork");
      send({ type: "SELECT_CHAIN", chainId: chain.id });
    },
    onMutate(data) {
      console.log("onMutate", data);
      if (chain.id == data.chainId) {
        // If you select the currently selected chain, onSuccess would otherwise not be called.
        send({ type: "SELECT_CHAIN", chainId: data.chainId });
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

  const chainIds = state.context.invoice.coins.map(
    (tokenInfo: TokenInfo) => tokenInfo.chainId
  );
  const availableChains = CHAINS.filter((chain) => {
    return chainIds.includes(chain.chainId);
  });

  if (connector?.id === "walletConnect") {
    // If wallet provider is wallet connect, we have to pick the chain
    // that is pre-selected by wallet connect.
    // This needs to be handled better/more consistently, e.g. using useConnect({chainId: 1})
    React.useEffect(() => {
      // Run! Like go get some data from an API.
      if (connector?.id === "walletConnect") {
        send({ type: "SELECT_CHAIN", chainId: chain.id });
      }
    }, []);
    return <></>;
  } else {
    // STATE: SELECT BLOCKCHAIN
    return (
      <>
        <div className="overflow-hidden bg-white pt-2 sm:rounded-md">
          <ul role="list" className="divide-y divide-purple-300">
            {availableChains.map((chain) => (
              <li key={chain.chainId}>
                <a
                  href="#"
                  onClick={() => {
                    switchNetwork(chain.chainId);
                  }}
                  className="block hover:bg-pink-50"
                >
                  <div className="flex items-center px-0 py-3 sm:px-4">
                    <div className="flex min-w-0 flex-1 items-center">
                      <div className="flex-shrink-0 ">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={chain.logoUri}
                        />
                      </div>
                      <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                        <div>
                          <p className="mt-2 truncate text-sm font-medium text-indigo-600">
                            {chain.chainName}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            {/* <EnvelopeIcon
                            className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                          /> */}
                            <span className="truncate"></span>
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-5 mt-4 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          {chain.tokens?.map((token) => (
                            <img
                              key={token.address}
                              className="inline-block h-8 w-8"
                              src={token.logoUri}
                              alt={token.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}
