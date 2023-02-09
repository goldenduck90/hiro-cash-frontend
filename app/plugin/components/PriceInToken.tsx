import * as React from "react";
import type { BigNumber } from "ethers/lib/ethers";
import { useContractRead } from "wagmi";
import { priceFeedFor } from "~/plugin/utils";
function formatCurrency(minor: number) {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  return formatter.format(minor / 100); /* $2,500.00 */
}
export default function PriceInToken({
  chain,
  invoice,
  tokenInfo,
}: {
  chain: any;
  invoice: any;
  tokenInfo: any;
}) {
  const currency = invoice.currency;
  const amountInMinor = invoice.amountInMinor;

  const priceFeed = priceFeedFor(chain, currency, tokenInfo);

  if (priceFeed) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let { data } = useContractRead({
      address: priceFeed,
      abi: [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      ],
      functionName: "latestRoundData",
      cacheTime: 30_000,
    });

    let converted;

    if (data && data[1 as keyof typeof data]) {
      const exchangeRate = data[1 as keyof typeof data] as BigNumber; // BigNum

      converted = Number(exchangeRate.mul(amountInMinor).div(10 ** 8)) / 100;
    }

    return <>{converted && converted.toString()}</>;
  } else {
    return <>{formatCurrency(amountInMinor)}</>;
  }
}
