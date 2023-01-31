//@ts-check
import * as React from "react";
import { usePayment } from "../hooks";
import { useDisconnect } from "wagmi";
import PaymentDialog from "./PaymentDialog";
import ChainDialog from "./ChainDialog";
import TokenChooser from "./TokenChooser";
import ReceiptDialog from "./ReceiptDialog";
import BreadcrumbBar from "./BreadcrumbBar";
import Header from "./Header";
import truncateEthAddress from "truncate-eth-address";
import { PowerIcon } from "@heroicons/react/20/solid";

import { useAccount, useNetwork, useSigner, useConnect } from "wagmi";
import { useEffect } from "react";
import { getChainById } from "~/plugin/constants/Chains";

function SubHeader() {
  const { state } = usePayment();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  // const chainInfo = getChainById(chain.id);

  const chainInfo = state.context?.chain;

  return (
    <div className="py-4 grid grid-cols-1 gap-4 border-b-1 border-sky-100">
      <div className="text-right">
        {chainInfo && (
          <div className="mr-3 inline-flex items-center rounded-lg bg-gray-100 px-2 py-2 text-sm font-medium text-indigo-800">
            <span>{chainInfo?.chainName}</span>
            <div className="flex-shrink-0 ">
              <img className="h-4 w-4" src={chainInfo?.logoUri} />
            </div>
          </div>
        )}
        <div className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-2 text-sm font-medium text-indigo-800">
          {truncateEthAddress(address)}{" "}
          <button onClick={() => disconnect()}>
            <PowerIcon className="h-4 w-4 ml-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HiroMain() {
  const { state, send } = usePayment();

  const invoice = state.context.invoice;

  const { address, isConnected, isConnecting, isDisconnected } = useAccount({
    onDisconnect() {
      console.log("disconnecting");
      send("DISCONNECT");
    },
  });
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  // This has to work in 2 cases:
  // - user has just connected
  // - user is already connected with metamask.
  useEffect(() => {
    if (state.matches("disconnected") && isConnected && signer) {
      send({
        type: "CONNECT",
        address: address,
        signer: signer,
      });
    }
  }, [state.matches("disconnected"), isConnected, signer]);

  if (state.matches("disconnected") || state.matches("connecting")) {
    return (
      <>
        <Header receiver={invoice.merchantAddress}></Header>
        <div className="px-6 py-3 text-base font-bold ">Connect Wallet</div>
        <div className="pt-2 overflow-hidden bg-white">
          <ul role="list" className="divide-y divide-blue-300">
            {connectors.map((connector) => (
              <li
                key={connector.id}
                className="flex items-center px-0 py-3 sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`/img/wallets/${connector.id.toLocaleLowerCase()}.svg`}
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
  } else if (state.matches("connected.no_chain")) {
    return (
      <>
        <Header></Header>
        <SubHeader />
        <ChainDialog />
      </>
    );
  } else if (state.matches("connected.no_token")) {
    return (
      <>
        <Header></Header>
        <SubHeader />
        <TokenChooser />
      </>
    );
  } else if (state.matches("connected.ready")) {
    return (
      <>
        <Header></Header>
        <SubHeader />
        <PaymentDialog />
      </>
    );
  } else if (state.matches("connected.completed")) {
    return (
      <>
        <Header></Header>
        <BreadcrumbBar currentTab="receipt" />
        <ReceiptDialog></ReceiptDialog>
      </>
    );
  }
  return null;
}
