//@ts-check
import { useDisconnect, useNetwork } from "wagmi";
import type { PaymentReceipt } from "./PaymentDialog";
import PaymentDialog from "./PaymentDialog";
import ChainDialog from "./ChainDialog";
import TokenChooser from "./TokenChooser";
import ReceiptDialog from "./ReceiptDialog";
import Header from "./Header";
import truncateEthAddress from "truncate-eth-address";
import { PowerIcon } from "@heroicons/react/20/solid";

import { useAccount, useConnect } from "wagmi";
import { useState } from "react";

import type { ChainInfo, TokenInfo } from "@hiropay/tokenlists";
import { getChain } from "@hiropay/tokenlists";
import { usePayment } from "../hooks";
import { ConnectWalletDialog } from "./ConnectWalletDialog";
import type { ethers } from "ethers";

function SubHeader() {
  const { address } = useAccount();
  const { disconnect, disconnectAsync } = useDisconnect();
  const { chain } = useNetwork();

  const chainInfo = getChain(chain!.id);

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
          {address && truncateEthAddress(address)}{" "}
          <button
            onClick={() => {
              disconnectAsync();
            }}
          >
            <PowerIcon className="ml-4 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

//
// const fakeReceipt = {
//   hash: "0x123",
//   chain: getChain(5),
//   receipt: {} as ethers.providers.TransactionReceipt,
// };

export default function HiroMain() {
  const { invoice } = usePayment();
  const [chain, setChain] = useState<ChainInfo | null>(null);
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [tx, setTx] = useState<PaymentReceipt | null>(null);

  const { isConnected } = useAccount();
  const { isLoading } = useConnect();

  if (!isConnected || isLoading) {
    return (
      <>
        <Header />
        <ConnectWalletDialog />
      </>
    );
  } else if (tx) {
    return (
      <>
        <Header />
        <ReceiptDialog tx={tx} invoice={invoice} />
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
  }
  return null;
}
