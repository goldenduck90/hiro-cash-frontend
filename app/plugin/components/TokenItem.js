import { utils } from "ethers";
import * as React from "react";
import { usePayment } from "../hooks";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { parseAmountInMinorForComparison } from "~/plugin/utils";
import { classnames } from "tailwindcss-classnames";

const formatToken = (number) => {
  const numberFormat = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return numberFormat.format(number);
};

export default function TokenItem({ balance, tokenInfo, amountInMinor }) {
  const { state, send } = usePayment();
  const { chain, invoice } = state.context;
  const isBalanceSufficient = (balance) => {
    const amount = parseAmountInMinorForComparison(
      invoice.amountInMinor.toString(),
      balance.tokenInfo.decimals
    );
    return balance.balance.gte(amount);
  };

  return (
    <li key={tokenInfo.address}>
      <a
        href="#"
        onClick={() =>
          isBalanceSufficient(balance) &&
          send({ type: "SELECT_TOKEN", token: tokenInfo })
        }
        className="block hover:bg-blue-50"
      >
        <div
          className={classnames(
            "flex",
            "items-center",
            "px-0",
            "py-3",
            "sm:px-6",
            isBalanceSufficient(balance) ? "opacity-100" : "opacity-50"
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
                <div className="text-md truncate pt-0 text-right font-medium text-gray-400">
                  {balance.balance
                    ? formatToken(
                        Math.abs(
                          Math.round(balance.balance / 10 ** tokenInfo.decimals)
                        )
                      )
                    : "..."}
                </div>
              </div>
            </div>
          </div>
          <div>
            <ChevronRightIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </a>
    </li>
  );
}
