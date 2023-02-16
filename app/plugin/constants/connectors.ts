import type { Chain } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

export function metaMaskConnector(chains: Chain[]): MetaMaskConnector {
  return new MetaMaskConnector({
    chains: chains,
  });
}

export function walletConnect2Connector(
  chains: Chain[]
): WalletConnectConnector {
  return new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      version: "2",
      projectId: "fba45f29001cdfe9595549f725192905",
    },
  });
}

export function walletConnectConnector(
  chains: Chain[]
): WalletConnectConnector {
  return new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      version: "1",
    },
  });
}
