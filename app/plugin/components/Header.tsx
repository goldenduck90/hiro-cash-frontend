import * as React from "react";
import { usePayment } from "~/plugin/hooks";
import { tokenAmount } from "~/plugin/tokenAmount";
import { DEFAULT_CURRENCY } from "~/plugin/constants";
import truncateEthAddress from "truncate-eth-address";

export default function Header() {
  const { state } = usePayment();

  const invoice = state.context.invoice;
  const receiver = truncateEthAddress(invoice.merchantAddress);
  const amount = tokenAmount(state);
  const currency = invoice.currency || DEFAULT_CURRENCY;

  return (
    <div className="border-b border-gray-200 bg-white px-0 py-2">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 mt-4">
          <h3 className="text-2xl font-bold leading-6 text-gray-800">
            Payment
          </h3>
          <p className="mt-4 text-sm text-gray-500">To: {receiver}</p>
        </div>
        <div className="ml-4 mt-4 flex-shrink-0">
          <h3 className="text-2xl font-bold leading-6 text-gray-800">
            {amount} <span className="text-gray-400">{currency}</span>
          </h3>
          <p className="mt-4 text-sm text-gray-500 text-right"> </p>
        </div>
      </div>
    </div>
  );
}
