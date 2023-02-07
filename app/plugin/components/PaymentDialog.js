import * as React from "react";
import { usePayment } from "~/plugin/hooks";
import PriceInToken from "~/plugin/components/PriceInToken";
import { paymentPayload } from "~/plugin/machines/services";

const spinner = (
  <svg className="white-500 mr-3 h-4 w-4 animate-spin" viewBox="0 0 22 22">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const ApproveButton = () => {
  const { state, send } = usePayment();
  const { balance } = state.context;
  if (state.matches("connected.ready.allowance_insufficient")) {
    return (
      <>
        <button
          size="large"
          onClick={() => send({ type: "INCREASE_ALLOWANCE" })}
          className="mx-4 inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Approve {balance.tokenInfo.symbol}
        </button>
        <div className="text-center text-red-500">
          {state.matches("connected.ready.allowance_insufficient") &&
            state.context.error?.message}
        </div>
      </>
    );
  }

  if (state.matches("connected.ready.check_approval.increasing_allowance")) {
    return (
      <button
        size="large"
        className="mx-4 inline-flex items-center rounded-md border border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {spinner}
        Approving {balance.tokenInfo.symbol}
      </button>
    );
  }

  return null;
};

export default function PaymentDialog(props) {
  const { state, send } = usePayment();
  const { balance, chain } = state.context;

  // function formatCurrency(minor) {
  //   var formatter = new Intl.NumberFormat("en-US", {
  //     style: "currency",
  //     currency: invoice.currency,

  //     // These options are needed to round to whole numbers if that's what you want.
  //     //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //     //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  //   });

  //   return formatter.format(minor / 100); /* $2,500.00 */
  // }

  const token = balance.tokenInfo;

  const payload = paymentPayload(state.context);

  return (
    <>
      <div className="overflow-hidden bg-white  sm:rounded-lg">
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <PriceInToken
                  chain={chain}
                  invoice={state.context.invoice}
                  tokenInfo={token}
                />{" "}
                <strong title={token.address}>{token.symbol}</strong>
              </dd>
            </div>
          </dl>
          <code className="whitespace-pre-line">
            {false && JSON.stringify(payload, null, 4)}
          </code>
        </div>
      </div>
      <div className="bg-white px-4 py-3 text-center sm:px-6">
        <button
          type="button"
          disabled={!state.matches("connected.ready.allowance_sufficient")}
          onClick={() =>
            !state.matches("connected.ready.allowance_sufficient.paying") &&
            send({ type: "PAY" })
          }
          className="inline-flex items-center rounded-md border-0 border-transparent bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-lg font-medium text-white shadow shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {state.matches("connected.ready.allowance_sufficient.paying") ? (
            <>
              {spinner}
              Paying . . .
            </>
          ) : (
            <>Confirm Payment</>
          )}
        </button>
        <ApproveButton />
      </div>
      <div className="text-center text-red-500">
        {state.matches("connected.ready.allowance_sufficient.failed") &&
          state.context.error?.reason}
      </div>
    </>
  );
}
