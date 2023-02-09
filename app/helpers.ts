import { chainlist, getChain, tokenlist } from "@hiropay/tokenlists";
import type { ChainInfo, TokenInfo } from "@hiropay/tokenlists";
import type { Wallet } from "./models/wallet.server";

const tokens = tokenlist.tokens;
const chains = chainlist.chains;

export const coinIdToToken = (coinId: string) => {
  const [symbol, chainIdString] = coinId.split("-");
  const token = tokens.find(
    (t) => t.symbol === symbol && t.chainId === parseInt(chainIdString)
  );
  return token;
};

export const coinIdToChain = (coinId: string) => {
  const [_symbol, chainIdString] = coinId.split("-");
  const chain = getChain(parseInt(chainIdString));
  return chain;
};

export function supportedTokensOfWallet(wallet: Wallet): TokenInfo[] {
  const coinIds = wallet.config["coins"] || [];
  const tokens: TokenInfo[] = [
    ...new Set<TokenInfo>(coinIds.map(coinIdToToken)),
  ].filter((c) => c != undefined);
  return tokens;
}

export function supportedChainsOfWallet(wallet: Wallet): ChainInfo[] {
  const coinIds = wallet.config["coins"] || [];
  const chains: ChainInfo[] = [
    ...new Set<ChainInfo>(coinIds.map(coinIdToChain)),
  ].filter((c) => c != undefined);
  return chains;
}
