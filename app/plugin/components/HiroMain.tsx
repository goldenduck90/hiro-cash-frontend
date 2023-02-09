//@ts-check
import { useDisconnect, useNetwork } from "wagmi";
import PaymentDialog from "./PaymentDialog";
import ChainDialog from "./ChainDialog";
import TokenChooser from "./TokenChooser";
import ReceiptDialog from "./ReceiptDialog";
import Header from "./Header";
import truncateEthAddress from "truncate-eth-address";
import { PowerIcon } from "@heroicons/react/20/solid";

import { useAccount, useConnect } from "wagmi";
import { useState } from "react";

import { connectorWalletIcon } from "../view/walletHelper";
import { getChain } from "@hiropay/tokenlists";
import { usePayment } from "../hooks";

function SubHeader() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  // const chainInfo = getChainById(chain.id);

  const chainInfo = getChain(chain.id);

  return (
    <div className="border-b-1 grid grid-cols-1 gap-4 border-sky-100 py-4">
      <div className="text-right">
        {chainInfo && (
          <div className="mr-3 inline-flex items-center rounded-lg bg-gray-100 px-2 py-2 text-sm font-medium text-indigo-800">
            <span>{chainInfo?.chainName}</span>
            <div className="flex-shrink-0 ">
              <img
                className="h-4 w-4"
                src={chainInfo?.logoUri}
                alt="Chain Logo"
              />
            </div>
          </div>
        )}
        <div className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-2 text-sm font-medium text-indigo-800">
          {truncateEthAddress(address)}{" "}
          <button onClick={() => disconnect()}>
            <PowerIcon className="ml-4 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HiroMain() {
  const { invoice } = usePayment();
  const [chain, setChain] = useState(null);
  const [token, setToken] = useState(null);
  const [tx, setTx] = useState(null);

  const { address, isConnected } = useAccount({});

  const { connect, connectors, isLoading, pendingConnector } = useConnect();

  if (!isConnected || isLoading) {
    return (
      <>
        <Header />
        <div className="px-6 py-3 text-base font-bold ">Connect Wallet</div>
        <div className="overflow-hidden bg-white pt-2">
          <ul className="divide-y divide-blue-300">
            {connectors.map((connector) => (
              <li
                key={connector.id}
                className="flex items-center px-0 py-3 sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={connectorWalletIcon(connector)}
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                    <button
                      type="button"
                      disabled={!connector.ready}
                      onClick={() => connect({ connector })}
                      className="w-full text-left text-lg font-bold text-indigo-600"
                    >
                      {connector.name}
                      {isLoading &&
                        pendingConnector?.id === connector.id &&
                        " (connecting)"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  } else if (chain == null && token == null) {
    return (
      <>
        <Header />
        <SubHeader />
        <ChainDialog setChain={setChain} />
      </>
    );
  } else if (chain != null && token == null) {
    return (
      <>
        <Header />
        <SubHeader />
        <TokenChooser chain={chain} setToken={setToken} />
      </>
    );
  } else if (chain && token) {
    return (
      <>
        <Header />
        <SubHeader />
        <PaymentDialog setTx={setTx} chain={chain} tokenInfo={token} />
      </>
    );
  } else if (tx) {
    return (
      <>
        <Header />
        <ReceiptDialog tx={tx} invoice={invoice} />
      </>
    );
  }
  return null;
}
