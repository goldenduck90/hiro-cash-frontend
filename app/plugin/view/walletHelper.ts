import metamaskIcon from "~/assets/images/wallets/metamask.svg";
import walletconnectIcon from "~/assets/images/wallets/walletconnect.svg";
import coinbasewalletIcon from "~/assets/images/wallets/coinbasewallet.svg";

const icons: { [key: string]: string } = {
  metamask: metamaskIcon,
  walletconnect: walletconnectIcon,
  coinbasewallet: coinbasewalletIcon,
};

export function connectorWalletIcon(connector: any): string | undefined {
  return icons[connector.id.toLocaleLowerCase()];
}

export function walletIcon(id: string): string | undefined {
  return icons[id];
}
