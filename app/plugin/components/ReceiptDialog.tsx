import { getChain } from "@hiropay/tokenlists";
import * as React from "react";
import { getTxUrl } from "~/plugin/utils";
import { CheckIcon } from "@heroicons/react/20/solid";

export default function ReceiptDialog({
  invoice,
  tx,
}: {
  invoice: any;
  tx: any;
}) {
  const onCompleteFunction = () => {
    if (invoice.onComplete) {
      //! Cannot find name 'context'.ts(2304)
      // invoice.onComplete(tx.transactionHash, context.chain);
    } else {
      // TODO: define what happens if no onComplete handler defined.
      // - possibly just close the window, e.g. for donations.
    }
  };

  const txUrl = getTxUrl(tx.chain, tx.hash);

  return (
    <>
      <div className="overflow-hidden bg-white  sm:rounded-lg">
        <div className="px-16 py-5 sm:px-6">
          <h3 className="rounded-xl bg-green-600 py-4 text-center text-lg font-medium leading-6 text-white">
            <CheckIcon className="mr-4 inline-block h-8 w-8" />
            Payment Successful
          </h3>
        </div>
        <div className=" border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dd className="mt-1 text-lg sm:col-span-2 sm:mt-0">
                <a
                  href={txUrl}
                  target="_blank"
                  className="text-underline text-indigo-600"
                  rel="noreferrer"
                >
                  Show Transaction on Explorer
                </a>{" "}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
