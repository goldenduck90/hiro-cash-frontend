import { ethers } from "ethers";
import assert from "minimalistic-assert";
import { abis, ChainInfo } from "@hiropay/tokenlists";

// export function tokensOfChain(tokens: TokenInfo[], chainId: number) {
//   return tokens.filter((token) => token.chainId == chainId);
// }
export function tokensOfChain(tokens, chainId) {
  return tokens.filter((token) => token.chainId == chainId);
}

export function priceFeedFor(chain, currency, tokenInfo) {
  let priceFeed;

  if (currency != "USD") {
    priceFeed = chain.priceFeeds[currency];
  }

  return priceFeed;
}

export function getPriceFeeds(chain, currency, tokenInfo) {
  let priceFeeds = [];

  let priceFeed = priceFeedFor(chain, currency, tokenInfo);

  if (priceFeed) priceFeeds.push(priceFeed);

  return priceFeeds;
}

export const getErc20Contract = (address, signer) => {
  const contract = new ethers.Contract(
    address,
    [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );
  return contract;
};

export const getRouterContract = (address, signer) => {
  return new ethers.Contract(address, abis["0_1"], signer);
};

export const getTxUrl = (chain, txHash) => {
  const explorer = chain.explorerUrl;
  return `${explorer}/tx/${txHash}`;
};

export const parseAmountInMinorForComparison = (
  amountInMinorString,
  comparisonDecimals
) => {
  assert(
    typeof amountInMinorString === "string",
    "This function expects amountInMinor passed as a string"
  );
  return ethers.utils.parseUnits(amountInMinorString, comparisonDecimals - 2);
};
