import { ethers } from "ethers";
import assert from "minimalistic-assert";
import type { TokenInfo } from "@hiropay/tokenlists";
import { abis } from "@hiropay/tokenlists";

// export function tokensOfChain(tokens: TokenInfo[], chainId: number) {
//   return tokens.filter((token) => token.chainId == chainId);
// }
export function tokensOfChain(tokens: TokenInfo[], chainId: number) {
  return tokens.filter((token: { chainId: any }) => token.chainId == chainId);
}

export function priceFeedFor(
  chain: { priceFeeds: { [x: string]: any } },
  currency: string,
  tokenInfo: TokenInfo
) {
  let priceFeed;

  if (currency != "USD") {
    priceFeed = chain.priceFeeds[currency];
  }

  return priceFeed;
}

export function getPriceFeeds(chain: any, currency: any, tokenInfo: TokenInfo) {
  let priceFeeds = [];

  let priceFeed = priceFeedFor(chain, currency, tokenInfo);

  if (priceFeed) priceFeeds.push(priceFeed);

  return priceFeeds;
}

export const ERC20abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

export const getErc20Contract = (
  address: string,
  signer: ethers.Signer | ethers.providers.Provider | undefined
) => {
  const contract = new ethers.Contract(address, ERC20abi, signer);
  return contract;
};

export const getRouterContract = (
  address: string,
  signer: ethers.Signer | ethers.providers.Provider | undefined
) => {
  return new ethers.Contract(address, abis["0_1"], signer);
};

export const getTxUrl = (chain: { explorerUrl: any }, txHash: any) => {
  const explorer = chain.explorerUrl;
  return `${explorer}/tx/${txHash}`;
};

export const parseAmountInMinorForComparison = (
  amountInMinorString: string,
  comparisonDecimals: number
) => {
  assert(
    typeof amountInMinorString === "string",
    "This function expects amountInMinor passed as a string"
  );
  return ethers.utils.parseUnits(amountInMinorString, comparisonDecimals - 2);
};
