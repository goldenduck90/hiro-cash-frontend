import * as React from "react";
import { utils } from "ethers";
import { useContractRead } from "wagmi";
import { priceFeedFor } from "~/plugin/utils";
function formatCurrency(minor) {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  return formatter.format(minor / 100); /* $2,500.00 */
}
export default function PriceInToken({ chain, invoice, tokenInfo }) {
  const currency = invoice.currency;
  const amountInMinor = invoice.amountInMinor;

  const priceFeed = priceFeedFor(chain, currency, tokenInfo);

  if (priceFeed) {
    let { data, isLoading } = useContractRead({
      address: priceFeed,
      abi: [
        "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
      ],
      functionName: "latestRoundData",
      cacheTime: 30_000,
    });

    let converted;

    if (data && data[1]) {
      const exchangeRate = data[1]; // BigNum
      const decimals = 8; // TODO ensure it's always 8.

      converted = exchangeRate.mul(amountInMinor).div(10 ** 8) / 100;
    }

    return <>{converted && converted.toString()}</>;
  } else {
    return <>{formatCurrency(amountInMinor)}</>;
  }
}
