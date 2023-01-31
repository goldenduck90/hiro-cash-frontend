import { utils } from "ethers";
import { chainlist, getTokens, latestRouter } from "@hiropay/tokenlists";

export function walletParams(chain) {
  if (!chain) {
    return undefined;
  }

  return {
    chainName: chain.chainName,
    chainId: utils.hexValue(chain.chainId),
    rpcUrls: chain.rpcUrls,
    blockExplorerUrls: [chain.explorerUrl],
  };
}

function chainConfig(chain) {
  const tokens = getTokens(chain.chainId);
  const router = latestRouter(chain.chainId);

  return Object.assign(
    {
      tokens: tokens,
      router: router?.address,
    },
    chain
  );
}

export const TEST_NETS = chainlist.chains
  .filter((chain) => chain.testnet)
  .map(chainConfig);

export const MAIN_NETS = chainlist.chains
  .filter((chain) => !chain.testnet)
  .map(chainConfig);

export const CHAINS = MAIN_NETS.concat(TEST_NETS);

export const getChainById = (chainId) => {
  return CHAINS.find((c) => c.chainId === chainId);
};
