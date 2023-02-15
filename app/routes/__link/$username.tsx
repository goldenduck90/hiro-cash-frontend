//@ts-nocheck

import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { findAccount } from "~/models/account.server";
import invariant from "tiny-invariant";

import PluginContainer from "~/plugin/PluginContainer";

import HiroMain from "~/plugin/components/HiroMain";

import { PaymentProvider } from "~/plugin/context/PaymentProvider";
import type { SetStateAction } from "react";
import { useState } from "react";
import { coinIdtoToken } from "~/utils";
import { useForm } from "react-hook-form";
import CurrencyInput from "react-currency-input-field";
import { CHAINS } from "~/plugin/constants/Chains";
import { walletIcon } from "~/plugin/view/walletHelper";
import { mixpanel, mixpanelTrack } from "~/services/mixpanel.server";

export async function loader({ request, params }: LoaderArgs) {
  const account = await findAccount(params.username);
  const wallet = account.wallets[0];

  invariant(wallet, "no wallet configured");
  mixpanel.track(account.username, "Payment Link");

  return json({
    account: account,
    wallet: wallet,
  });
}

export default function HiroLinkPage() {
  const [openPopup, setOpenPopup] = useState(false);
  const { account, wallet } = useLoaderData<typeof loader>();
  const [invoice, setInvoice] = useState<{
    memo: string;
    amountInMinor: number | null;
    merchantAddress: string;
    extraFeeAddress: string | null;
    extraFeeDivisor: string | null;
    currency: string;
    coins: object;
    onComplete: any;
  }>({
    memo: "",
    amountInMinor: null,
    merchantAddress: "",
    extraFeeAddress: null,
    extraFeeDivisor: null,
    currency: "",
    coins: {},
    onComplete: () => {},
  });
  const [baseCurrency, setBaseCurrency] = useState("USD");

  const { register, getValues, handleSubmit } = useForm({
    defaultValues: {
      // memo: paymentConfig.memo,
      amount: null,
      baseCurrency: baseCurrency,
    },
  });

  const coinIds: any[] =
    wallet.config!["coins" as keyof typeof wallet.config] || [];
  const tokens = coinIds.map(coinIdtoToken);

  function baseCurrencyChanged(evt: {
    target: { value: SetStateAction<string> };
  }) {
    setBaseCurrency(evt.target.value);
  }

  const currSymbol =
    {
      EUR: "€",
      USD: "$",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      KRW: "₩",
      INR: "₹",
      RUB: "₽",
      TRY: "₺",
      BRL: "R$",
      CAD: "C$",
      AUD: "A$",
      NZD: "NZ$",
      CHF: "",
    }[baseCurrency] || "";

  const onSubmit = (data: any, event: any) => {
    event.preventDefault();

    const values: {
      baseCurrency: string;
      amount: number | null;
    } = getValues();

    // Ensure nothing gets overwritten:
    // if (invoice.amount) {
    //   values.amount = invoice.amount;
    // } else {
    values.amount = Math.floor(
      Number(values.amount?.toString().replace(",", "")) * 100
    );
    // }
    // if (invoice.memo) values.memo = invoice.memo;

    setInvoice({
      memo: "",
      amountInMinor: values.amount,
      merchantAddress: wallet.address,
      extraFeeAddress: null,
      extraFeeDivisor: null,
      currency: values.baseCurrency,
      coins: tokens,
      onComplete: () => {},
    });

    setOpenPopup(true);
  };

  const chainIds = tokens.map((tokenInfo) => tokenInfo?.chainId);
  const availableChains = CHAINS.filter((chain) => {
    return chainIds.includes(chain.chainId);
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg bg-slate-800 p-6 text-white shadow">
        <div>
          <h3 className="text-lg font-medium leading-6 text-slate-100">
            Send money
          </h3>
        </div>
        <form
          className="mt-5 border-t border-slate-900"
          onSubmit={handleSubmit(onSubmit)}
        >
          <dl className="">
            <div className="py-4 text-xl sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className=" font-medium text-gray-400">To</dt>
              <dd className="mt-1 flex text-slate-100 sm:col-span-2 sm:mt-0">
                <span className="flex-grow font-mono ">
                  @{account.username}
                </span>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-400">Address</dt>
              <dd className="mt-1 flex text-sm text-slate-100 sm:col-span-2 sm:mt-0">
                <span className="flex-grow font-mono">{wallet.address}</span>
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-400">Amount</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div className="relative mt-1 w-60 rounded-md text-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-100">{currSymbol}</span>
                  </div>
                  <CurrencyInput
                    decimalScale={2}
                    intlConfig={{ locale: "en-US" }}
                    autoFocus={true}
                    placeholder="___.__"
                    className="block w-full rounded-md bg-slate-900 pl-7 pr-12 text-xl text-white focus:border-indigo-500 focus:ring-indigo-500"
                    {...register("amount", {
                      required: true,
                      // disabled: invoice?.amount != null,
                      validate: {
                        positive: (v: string) =>
                          parseFloat(v.replaceAll(",", "")) > 0,
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
                      onChange={baseCurrencyChanged}
                      className="h-full w-24 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-xl text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
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
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-400"></dt>
              <dd className="mt-1 flex text-lg text-slate-100 sm:col-span-2 sm:mt-0">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-8 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Pay
                </button>
              </dd>
            </div>
            <div className="mt-8 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-400">
                Supported Wallets
              </dt>
              <dd className="mt-1 flex text-sm text-slate-100 sm:col-span-2 sm:mt-0">
                {["metamask", "walletconnect", "coinbasewallet"].map(
                  (wallet) => {
                    return (
                      <img
                        key={wallet}
                        className="mr-1 h-6 w-6 rounded-full"
                        src={walletIcon(wallet)}
                        alt={wallet}
                      />
                    );
                  }
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-400">
                Supported Chains
              </dt>
              <dd className="mt-1 flex text-sm text-slate-100 sm:col-span-2 sm:mt-0">
                {availableChains.map((chain) => (
                  <img
                    key={chain.chainId}
                    className="mr-1 h-6 w-6 rounded-full"
                    src={chain.logoUri}
                    alt=""
                  />
                ))}
              </dd>
            </div>
          </dl>
        </form>
      </div>
      {openPopup && (
        <PaymentProvider invoice={invoice}>
          <PluginContainer open={openPopup} setOpen={setOpenPopup}>
            <HiroMain />
          </PluginContainer>
        </PaymentProvider>
      )}
    </>
  );
}
