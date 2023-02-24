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
import type { SendTransactionResult } from "@wagmi/core";

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
  if (invoice.extraFeeAddress === "FEE_TREASURY") {
    // use a mulitisig owner as a fallback in case feeTreasury nil.
    const FALLBACK_ADDRESS = "0x6b813ABF97bc51b8A0e04d6ec974A20663Fd6Bf1";
    extraFeeAddress = chain.feeTreasury || FALLBACK_ADDRESS;
  } else if (invoice.extraFeeAddress != ethers.constants.AddressZero) {
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

export function TransactionProgress({
  chain,
  setTx,
  transaction,
}: {
  chain: ChainInfo;
  setTx: Function;
  transaction: SendTransactionResult;
}) {
  const { data, isError, isLoading, error } = useWaitForTransaction({
    hash: transaction.hash,
    onSuccess(data) {
      if (data.status == 1) {
        setTx({
          hash: transaction.hash,
          chain: chain,
          receipt: data,
        });
      }
    },
  });

  return (
    <div>
      <>
        {data && data.status == 0 && "Transaction failed"}
        {isLoading && <div>{spinner}</div>}
        {isError && error}
      </>
    </div>
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
  const [transaction, setTransaction] = useState<SendTransactionResult | null>(
    null
  );
  const [allowanceOk, setAllowanceOk] = useState<boolean>(false);

  const routerAddress = latestRouter(chain.chainId).address as Address;

  const allowance = useContractRead({
    address: tokenInfo.address as Address,
    abi: ERC20abi,
    functionName: "allowance",
    args: [address, routerAddress],
    onSuccess(data) {
      setAllowanceOk(isAllowanceSufficient(allowance.data));
    },
  });

  const payload = paymentPayload({ invoice, chain, tokenInfo });

  const isAllowanceSufficient = (balance: any) => {
    const amount = parseAmountInMinorForComparison(
      invoice.amountInMinor.toString(),
      tokenInfo.decimals
    );
    return balance && balance.gte(amount);
  };

  const maxAllowance = ethers.constants.MaxUint256;
  const allowPrepared = usePrepareContractWrite({
    address: tokenInfo.address as Address,
    abi: ERC20abi,
    functionName: "approve",
    args: [latestRouter(chain.chainId).address, maxAllowance],
    onSuccess(data) {
      console.log("refetching:");
      allowance.refetch();
    },
  });

  const allowWrite = useContractWrite(allowPrepared.config);

  const { config } = usePrepareContractWrite({
    address: routerAddress,
    abi: abis["0_1"],
    functionName: "payWithToken",
    args: payload,
  });
  const payment = useContractWrite({
    ...config,
    onMutate(data) {
      console.log(data);
    },
    onSuccess(data) {
      console.log(data);
      setTransaction(data);
    },
    onError(error) {
      console.log("Error", error);
    },
    onSettled(data, error) {
      console.log("Settled", { data, error });
    },
  });

  function paymentPressed() {
    payment.writeAsync?.();
  }

  useEffect(() => {
    setAllowanceOk(
      allowance.isSuccess && isAllowanceSufficient(allowance.data)
    );
  }, []);

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
        {transaction && (
          <TransactionProgress
            chain={chain}
            setTx={setTx}
            transaction={transaction}
          />
        )}
        {!transaction && allowanceOk && (
          <button
            type="button"
            disabled={!allowanceOk}
            onClick={paymentPressed}
            className="inline-flex items-center rounded-md border-0 border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {/* {!payment.isLoading ? ( */}
            {payment.isLoading ? (
              <>
                {spinner}
                Paying . . .
              </>
            ) : (
              <>Confirm Payment</>
            )}
          </button>
        )}
        {!transaction && !allowanceOk && (
          <button
            // size="large"
            disabled={allowance.isLoading}
            onClick={allowWrite.write}
            className="mx-4 inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {!allowWrite.isLoading && `Approve ${tokenInfo.symbol}`}
            {allowWrite.isLoading && (
              <>
                {spinner} Approving {tokenInfo.symbol}
              </>
            )}
          </button>
        )}
      </div>
      <div className="text-center text-red-500">
        {/* {state.matches("connected.ready.allowance_sufficient.failed") &&
          state.context.error?.reason} */}
      </div>
    </>
  );
}
