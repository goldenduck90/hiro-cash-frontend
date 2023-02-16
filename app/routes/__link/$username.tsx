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
import { mixpanel } from "~/services/mixpanel.server";
import AppHeader from "~/components/app_header";
import { FOOTER_BUTTON } from "~/styles/elements";
import truncateEthAddress from "truncate-eth-address";

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
      <div className="mb-8 border-b border-slate-900 px-4 py-5 sm:px-6">
        <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
          <div className="ml-4">
            <h3 className="font-mono text-lg leading-6 text-gray-200">
              @{account.username}
            </h3>
            <p className="mt-1 font-mono text-sm text-gray-500">
              {wallet.address}
            </p>
          </div>
          <div className="ml-4 mt-4 flex-shrink-0"></div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-slate-800 p-6 py-0 text-white ">
        <form className="" onSubmit={handleSubmit(onSubmit)}>
          <dl className="">
            <div className="py-4 ">
              <div className="relative mx-auto mt-1 w-full rounded-md text-2xl shadow-sm md:w-1/2 lg:w-1/3">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-100">{currSymbol}</span>
                </div>
                <CurrencyInput
                  decimalScale={2}
                  intlConfig={{ locale: "en-US" }}
                  autoFocus={true}
                  className="block w-full rounded-md bg-slate-900 py-3 pr-28 pl-10 text-right text-2xl text-white focus:border-indigo-500 focus:ring-indigo-500"
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
                    className="h-full w-24 rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-2xl text-slate-100 focus:border-indigo-500 focus:ring-indigo-500"
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
            </div>
            <div className="py-4 text-center sm:py-5">
              <button
                type="submit"
                className={FOOTER_BUTTON + " w-full md:w-1/2 lg:w-1/3"}
              >
                Send Money
              </button>
            </div>
            <div className="mt-8 py-4 sm:py-5">
              <div className="text-center text-sm font-light text-gray-400">
                Hiro works with most wallets:
              </div>
              <dd className="mt-1 text-center text-sm text-slate-100 ">
                {["metamask", "walletconnect", "coinbasewallet"].map(
                  (wallet) => {
                    return (
                      <img
                        key={wallet}
                        className="mr-1 inline-block h-6 w-6 rounded-full"
                        src={walletIcon(wallet)}
                        alt={wallet}
                      />
                    );
                  }
                )}
              </dd>
            </div>
            <div className="text-center text-sm font-light text-gray-400">
              Receiver accepts following chains:
            </div>
            <div className="mt-1 text-center text-sm text-slate-100 ">
              {availableChains.map((chain) => (
                <img
                  key={chain.chainId}
                  className="mr-1 inline-block h-6 w-6 rounded-full"
                  src={chain.logoUri}
                  alt=""
                />
              ))}
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
