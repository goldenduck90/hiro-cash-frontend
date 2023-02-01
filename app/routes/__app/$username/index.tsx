import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import twitter from "~/assets/images/twitter.svg";
import github from "~/assets/images/github.svg";
import { findAccount } from "~/models/account.server";
import truncateEthAddress from "truncate-eth-address";
import invariant from "tiny-invariant";

import PluginContainer from "~/plugin/PluginContainer";
import HiroLinkContainer from "~/plugin/HiroLinkContainer";

import HiroMain from "~/plugin/components/HiroMain";

import { PaymentProvider } from "~/plugin/context/PaymentProvider";
import { useState } from "react";
import { coinIdtoToken } from "~/utils";
import { useForm } from "react-hook-form";
import CurrencyInput from "react-currency-input-field";

export async function loader({ request, params }: LoaderArgs) {
  const account = await findAccount(params.username);
  const wallet = account.wallets[0];

  invariant(wallet, "no wallet configured");

  return json({
    account: account,
    wallet: wallet,
  });
}

export default function HiroLinkPage() {
  const { account, wallet } = useLoaderData<typeof loader>();
  const [invoice, setInvoice] = useState(null);
  const [payment, setPayment] = useState(null);
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    defaultValues: {
      // memo: paymentConfig.memo,
      amount: null,
      baseCurrency: "USD",
    },
  });

  const coinIds = wallet.config["coins"] || [];
  const tokens = coinIds.map(coinIdtoToken);

  const onSubmit = (data, event) => {
    event.preventDefault();

    const values = getValues();

    // Ensure nothing gets overwritten:
    // if (invoice.amount) {
    //   values.amount = invoice.amount;
    // } else {
    values.amount = Math.floor(values.amount.replace(",", "") * 100);
    // }
    // if (invoice.memo) values.memo = invoice.memo;

    console.log(values);

    setInvoice({
      memo: "",
      amountInMinor: values.amount,
      merchantAddress: wallet.address,
      extraFeeAddress: null,
      extraFeeDivisor: null,
      currency: "USD",
      coins: tokens,
      onComplete: () => {},
    });
  };

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={handleSubmit(onSubmit)}>
        <span className="font-mono text-xl">@{account.username}</span>
        <p className="mt-2">
          <img
            src={twitter}
            className="mt-2 inline-block h-4 w-4 grayscale"
            aria-hidden="true"
          />
          <span className="font-mono text-sm">@{account.username}</span>
        </p>

        <p>
          Address: <span className="font-mono text-sm">{wallet.address}</span>
        </p>

        <div className="relative mt-1 w-60 rounded-md text-xl shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-900">$</span>
          </div>
          <CurrencyInput
            decimalScale={2}
            intlConfig={{ locale: "en-US" }}
            autoFocus={true}
            placeholder=""
            className="block w-full rounded-md pl-7 pr-12 text-xl text-black focus:border-indigo-500 focus:ring-indigo-500"
            {...register("amount", {
              required: true,
              // disabled: invoice?.amount != null,
              validate: {
                positive: (v: string) => parseFloat(v.replaceAll(",", "")) > 0,
              },
            })}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">
              Currency
            </label>
            <select
              id="baseCurrency"
              {...register("baseCurrency")}
              className="h-full w-24 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-xl text-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
            >
              {["USD", "EUR", "CHF"].map((curr) => {
                return (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <p className="text-center">
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Pay
          </button>
        </p>
      </form>

      {invoice?.amountInMinor && (
        <PaymentProvider invoice={invoice}>
          <PluginContainer>
            <HiroMain />
          </PluginContainer>
        </PaymentProvider>
      )}
    </div>
  );
}
