//@ts-check
import * as React from "react";

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
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});

WagmiContainer.propTypes = {};

export default function WagmiContainer({ children }) {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
}
