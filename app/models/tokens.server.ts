import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";

const coins = tokenlist.tokens;

export function coinSelected(wallet: Wallet, coinId: string): boolean {
  const coins = wallet?.config["coins"] || [];
  return coins.includes(coinId);
}

export const coinsByChain: any = {};
coins.forEach((c) => {
  if (coinsByChain[c.chainId]) {
    coinsByChain[c.chainId].push(c);
  } else {
    coinsByChain[c.chainId] = [c];
  }
});

export const filteredChainIds: number[] = [];
routerlist.routers.forEach((routerInfo) => {
  if (routerInfo.version == "0.1") {
    if (!filteredChainIds.includes(routerInfo.chainId)) {
      filteredChainIds.push(routerInfo.chainId);
    }
  }
});

export const filteredChains = filteredChainIds
  .map((chainId) => {
    return getChain(chainId);
  })
  .filter((chain) => {
    // return chain && (SHOW_TESTNETS || !chain.testnet);
    return chain && chain.testnet != true;
  });
