import { useState, useEffect } from "react";
import { usePayment } from "../hooks";
import type { Address } from "wagmi";
import {
  useContractRead,
  usePrepareContractWrite,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import PriceInToken from "~/plugin/components/PriceInToken";
import type { ChainInfo, TokenInfo } from "@hiropay/tokenlists";
import { latestRouter, abis } from "@hiropay/tokenlists";
import {
  parseAmountInMinorForComparison,
  ERC20abi,
  getPriceFeeds,
} from "~/plugin/utils";
import { ethers } from "ethers";
import spinner from "~/plugin/view/spinner";

export type PaymentReceipt = {
  hash: string;
  chain: ChainInfo;
  receipt: ethers.providers.TransactionReceipt;
};

export function paymentPayload({
  invoice,
  tokenInfo,
  chain,
}: {
  invoice: any;
  tokenInfo: any;
  chain: any;
}) {
  const amount = parseAmountInMinorForComparison(
    invoice.amountInMinor.toString(),
    tokenInfo.decimals
  );

  let extraFeeAddress;
  if (invoice.extraFeeAddress != ethers.constants.AddressZero) {
    extraFeeAddress = invoice.extraFeeAddress;
  } else {
    extraFeeAddress = ethers.constants.AddressZero;
  }

  const priceFeeds = getPriceFeeds(chain, invoice.currency, tokenInfo);

  return [
    ethers.utils.formatBytes32String(invoice.memo ? invoice.memo : ""),
    amount.toString(),
    priceFeeds,
    tokenInfo.address,
    invoice.merchantAddress,
    extraFeeAddress || ethers.constants.AddressZero,
    invoice.extraFeeDivisor || 0,
  ];
}

function PaymentButton({ invoice, chain, tokenInfo, setTx }: any) {
  const routerAddress = latestRouter(chain.chainId).address as Address;
  const payload = paymentPayload({ invoice, chain, tokenInfo });

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: abis["0_1"],
    functionName: "payWithToken",
    args: payload,
  });
  const payment = useContractWrite({
    ...config,
  });

  const paymentTx = useWaitForTransaction({
    hash: payment.data?.hash,
    onSuccess(data) {
      if (data.status == 1) {
        setTx({
          hash: payment.data?.hash,
          chain: chain,
          receipt: data,
        });
      }
    },
  });

  function paymentPressed() {
    payment.writeAsync?.();
  }

  const isLoading = payment.isLoading || paymentTx.isLoading;

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={paymentPressed}
      className="inline-flex items-center rounded-md border-0 border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {isLoading ? (
        <>
          {spinner}
          Paying . . .
        </>
      ) : (
        <>Confirm Payment</>
      )}
    </button>
  );
}

export function ApproveButton({ tokenInfo, chain, allowance }: any) {
  const maxAllowance = ethers.constants.MaxUint256;
  const allowPrepared = usePrepareContractWrite({
    address: tokenInfo.address as Address,
    abi: ERC20abi,
    functionName: "approve",
    args: [latestRouter(chain.chainId).address, maxAllowance],
  });

  const allowWrite = useContractWrite(allowPrepared.config);
  const allowanceWriteTx = useWaitForTransaction({
    hash: allowWrite.data?.hash,
    onSuccess(data) {
      console.log("allowanceWriteTx.onSuccess");
      allowance.refetch();
    },
  });

  const isLoading = allowWrite.isLoading || allowanceWriteTx.isLoading;
  return (
    <button
      // size="large"
      disabled={isLoading}
      onClick={allowWrite.write}
      className="mx-4 inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {!isLoading && `Approve ${tokenInfo.symbol}`}
      {isLoading && (
        <>
          {spinner} Approving {tokenInfo.symbol}
        </>
      )}
    </button>
  );
}

export default function PaymentDialog({
  chain,
  tokenInfo,
  setTx,
}: {
  chain: ChainInfo;
  tokenInfo: TokenInfo;
  setTx: Function;
}) {
  const { invoice } = usePayment();
  const { address } = useAccount();
  const [allowanceOk, setAllowanceOk] = useState<boolean>(false);

  const routerAddress = latestRouter(chain.chainId).address as Address;

  const allowance = useContractRead({
    address: tokenInfo.address as Address,
    abi: ERC20abi,
    functionName: "allowance",
    args: [address, routerAddress],
    onSuccess(data) {
      console.log("allowance.onSuccess", data);
      const ok = isAllowanceSufficient(allowance.data);
      console.log("allowance sufficient? ", ok);
      setAllowanceOk(ok);
    },
  });

  const isAllowanceSufficient = (balance: any): boolean => {
    const amount = parseAmountInMinorForComparison(
      invoice.amountInMinor.toString(),
      tokenInfo.decimals
    );
    return balance && balance.gte(amount);
  };

  useEffect(() => {
    setAllowanceOk(
      allowance.isSuccess && isAllowanceSufficient(allowance.data)
    );
  }, []);

  let state;
  if (allowance.isLoading) {
    state = "loading";
  } else if (allowanceOk) {
    state = "confirming";
  } else {
    state = "allowing";
  }

  return (
    <>
      <div className="overflow-hidden">
        <div className="px-4 py-5 sm:p-0">
          <dl className="sm:divide-y">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-indigo-100">Amount</dt>
              <dd className="mt-1 text-sm text-indigo-100 sm:col-span-2 sm:mt-0">
                <PriceInToken
                  chain={chain}
                  invoice={invoice}
                  tokenInfo={tokenInfo}
                />{" "}
                <strong title={tokenInfo.address}>{tokenInfo.symbol}</strong>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="px-4 py-3 text-center sm:px-6">
        {state == "loading" && <div>{spinner}</div>}
        {state == "allowing" && (
          <ApproveButton
            tokenInfo={tokenInfo}
            chain={chain}
            allowance={allowance}
          />
        )}
        {state == "confirming" && (
          <PaymentButton
            invoice={invoice}
            chain={chain}
            tokenInfo={tokenInfo}
            setTx={setTx}
          />
        )}
      </div>
    </>
  );
}
