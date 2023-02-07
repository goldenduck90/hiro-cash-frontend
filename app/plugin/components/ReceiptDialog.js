//@ts-check
import * as React from "react";
import { usePayment } from "~/plugin/hooks";
import { getTxUrl } from "~/plugin/utils";

export default function ReceiptDialog() {
  // const { open, payment: paymentMachine, onComplete } = props;
  const { state } = usePayment();

  const context = state.context;
  const tx = context.tx;
  const invoice = state.context.invoice;

  const onCompleteFunction = () => {
    if (invoice.onComplete) {
      invoice.onComplete(tx.transactionHash, context.chain);
    } else {
      // TODO: define what happens if no onComplete handler defined.
      // - possibly just close the window, e.g. for donations.
    }
  };

  const txUrl = getTxUrl(context.chain, tx.transactionHash);

  return (
    <>
      <div className="overflow-hidden bg-white  sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Payment Successful
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500"></p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">TX Receipt</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a href={txUrl}>Payment Receipt</a>{" "}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          type="button"
          onClick={onCompleteFunction}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Continue with Merchant
        </button>
      </div>
    </>
  );
}
