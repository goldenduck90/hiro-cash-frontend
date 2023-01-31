//@ts-check
import * as React from "react";

// import { setupAnalytics } from "../reportWebVitals";
import { usePayment } from "~/plugin/hooks";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import {
  mainnet,
  avalanche,
  avalancheFuji,
  goerli,
  fantom,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { Buffer } from "buffer";

const { useState, Fragment } = React;

// polyfill Buffer for client
// if (!window.Buffer) {
//   window.Buffer = Buffer;
// }

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, avalanche, avalancheFuji, goerli, fantom],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: chain.rpcUrls.default[0] };
      },
    }),
  ]
);

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains: chains,
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: "Injected",
    //     shimDisconnect: true,
    //   },
    // }),
  ],
  provider,
  webSocketProvider,
});

PluginContainer.propTypes = {};

export default function PluginContainer({ children }) {
  const [open, setOpen] = useState(true);

  // setupAnalytics();

  return (
    <WagmiConfig client={client}>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10 mx-auto" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-r to-blue-300/75 from-pink-300/75 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="md:flex md:mt-16 items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm md:sm:max-w-2xl sm:p-6">
                  <div className="sm:hidden absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  {children}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </WagmiConfig>
  );
}
