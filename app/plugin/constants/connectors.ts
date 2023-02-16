import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

export function metaMask(chains: Chain[]): MetaMaskConnector {
  return new MetaMaskConnector({
    chains: chains,
  });
}

export function walletConnect2(chains: Chain[]): WalletConnectConnector {
  return new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      version: "2",
      projectId: "fba45f29001cdfe9595549f725192905",
    },
  });
}

export function walletConnect(chains: Chain[]): WalletConnectConnector {
  return new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      version: "1",
    },
  });
}
