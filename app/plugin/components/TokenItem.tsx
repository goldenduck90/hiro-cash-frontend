import { ChevronRightIcon } from "@heroicons/react/20/solid";
import type { TokenInfo } from "@hiropay/tokenlists";
import {
  classnames,
  display,
  flexBox,
  opacity,
  spacing,
  interactivity,
  backgrounds,
} from "tailwindcss-classnames";
import type { Address } from "wagmi";
import { useContractRead, useAccount } from "wagmi";
import { parseAmountInMinorForComparison, ERC20abi } from "~/plugin/utils";

const formatToken = (number: number | bigint) => {
  const numberFormat = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return numberFormat.format(number);
};

export default function TokenItem({
  tokenInfo,
  amountInMinor,
  setToken,
  invoice,
}: {
  tokenInfo: TokenInfo;
  amountInMinor: number;
  setToken: any;
  invoice: any;
}) {
  const { address } = useAccount();
  const { data: balance, isLoading } = useContractRead({
    address: tokenInfo.address as Address,
    abi: ERC20abi,
    functionName: "balanceOf",
    args: [address],
  }) as { data: any; isLoading: boolean };

  const isBalanceSufficient = () => {
    const amount = parseAmountInMinorForComparison(
      amountInMinor.toString(),
      tokenInfo.decimals
    );
    return balance && balance.gte(amount);
  };

  return (
    <li
      key={tokenInfo.address}
      onClick={(e) => {
        e.preventDefault();
        if (isBalanceSufficient()) {
          setToken(tokenInfo);
        }
      }}
      className="block"
    >
      <div
        className={classnames(
          flexBox("items-center"),
          display("flex"),
          spacing("px-0", "py-3", "sm:px-6"),
          opacity(isBalanceSufficient() ? "opacity-100" : "opacity-50"),
          interactivity(
            isBalanceSufficient()
              ? "hover:cursor-pointer"
              : "hover:cursor-not-allowed"
          ),
          backgrounds(
            isBalanceSufficient() ? "hover:bg-indigo-50" : "hover:bg-gray-100"
          )
        )}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={tokenInfo.logoUri}
              alt=""
            />
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-4 px-4">
            <div>
              <p className="text-md truncate pt-0 font-medium text-indigo-600">
                {tokenInfo.name}
              </p>
            </div>
            <div className="">
              <div className="text-md truncate pt-0 text-right font-medium text-gray-600">
                {!isLoading &&
                  formatToken(
                    Math.abs(Math.round(balance / 10 ** tokenInfo.decimals))
                  )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <ChevronRightIcon
            className="h-5 w-5 text-gray-600"
            aria-hidden="true"
          />
        </div>
      </div>
    </li>
  );
}
