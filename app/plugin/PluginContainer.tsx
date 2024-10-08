//@ts-nocheck
import * as React from "react";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import {
  mainnet,
  arbitrum,
  optimism,
  optimismGoerli,
  avalanche,
  avalancheFuji,
  goerli,
  fantom,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  metaMaskConnector,
  walletConnect2Connector,
} from "./constants/connectors";

const { Fragment } = React;

// polyfill Buffer for client
// if (!window.Buffer) {
//   window.Buffer = Buffer;
// }

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    avalanche,
    arbitrum,
    optimism,
    optimismGoerli,
    avalancheFuji,
    goerli,
    fantom,
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.rpcUrls.infura) {
          return {
            http: `${chain.rpcUrls.infura?.http}/7c96628b378d451fb1522e9de03413ee`,
          };
        } else {
          return {
            http: chain.rpcUrls.default[0],
          };
        }
      },
    }),
    publicProvider(),
    // jsonRpcProvider({
    //   rpc: (chain) => {
    //     return {
    //       http: chain.rpcUrls.default[0],
    //     };
    //   },
    // }),
  ]
);

export const configuredChains = chains;

// Set up client
const client = createClient({
  autoConnect: false,
  connectors: [
    metaMaskConnector(chains),
    // new CoinbaseWalletConnector({
    //   chains,
    //   options: {
    //     appName: "wagmi",
    //   },
    // }),
    walletConnect2Connector(chains),
    // new InjectedConnector({
    //   chains,
    //   options: {
    //     name: "Injected",
    //     shimDisconnect: true,
    //   },
    // }),
    // mobileWalletConnect,
  ],
  provider,
  webSocketProvider,
});

type PluginContainerType = {
  children: any;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function PluginContainer({
  children,
  open,
  setOpen,
}: PluginContainerType) {
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
            <div className="fixed inset-0 bg-opacity-75 bg-gradient-to-r from-slate-900/75 to-blue-900/75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="items-end justify-center p-4 text-center sm:items-center sm:p-0 md:mt-16 md:flex">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 md:max-w-2xl">
                  <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block sm:hidden">
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
