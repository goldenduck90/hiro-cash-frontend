import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import invariant from "tiny-invariant";
import { deleteAccount } from "~/models/account.server";
import { createWallet } from "~/models/wallet.server";
import type { Wallet } from "@prisma/client";

import truncateEthAddress from "truncate-eth-address";
import type { TokenInfo } from "@hiropay/tokenlists";
import { chainlist } from "@hiropay/tokenlists";

import { useField, useIsSubmitting, ValidatedForm } from "remix-validated-form";

import ethereumLogo from "~/assets/images/chains/ethereum.svg";
import { validator } from "./$id.wallet.$walletId";
import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";
import CardHeader from "~/components/__home/card_header";

const coins = tokenlist.tokens;

export function coinSelected(wallet: Wallet, coinId: string): boolean {
  const coins = wallet?.config["coins"] || [];
  return coins.includes(coinId);
}

export const coinsByChain: any = {};
coins.forEach((c) => {
  if (coinsByChain[c.chainId]) {
    coinsByChain[c.chainId].push(c);
  } else {
    coinsByChain[c.chainId] = [c];
  }
});

export const filteredChainIds: number[] = [];
routerlist.routers.forEach((routerInfo) => {
  if (routerInfo.version == "0.1") {
    if (!filteredChainIds.includes(routerInfo.chainId)) {
      filteredChainIds.push(routerInfo.chainId);
    }
  }
});

export const filteredChains = filteredChainIds
  .map((chainId) => {
    return getChain(chainId);
  })
  .filter((chain) => {
    // return chain && (SHOW_TESTNETS || !chain.testnet);
    return chain && chain.testnet != true;
  });

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  let authenticatedSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let oauth = await findFromSession(authenticatedSession);

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  invariant(account, "account not found");

  const wallet = account.wallets[0];

  return json({
    oauthCredential: oauth,
    account: account,
    primaryWallet: wallet,
  });
};

export const action: ActionFunction = async ({
  request,
  params,
}: ActionArgs) => {
  let authenticatedSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findFromSession(authenticatedSession);

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  if (!account) return redirect(".");
  invariant(account, "account not found");

  // const userId = await requireUserId(request);

  const wallet = account.wallets.find((w) => w.primary === true);
  if (wallet) {
    return redirect(".");
  } else {
    const result = await validator.validate(await request.formData());
    // if (result.error) return validationError(result.error);
    const data = result.data;

    const address = data["address"];
    await createWallet(account, address, {
      type: params.type,
      exchange: params.exchange,
      config: {
        coins: data["coins"],
      },
    });

    return redirect(`/home/${account.username}`);
  }
};

const tokens = tokenlist.tokens;
const chains = chainlist.chains;

const coinIdToToken = (coinId: string) => {
  const [symbol, chainIdString] = coinId.split("-");
  const token = tokens.find(
    (t) => t.symbol === symbol && t.chainId === parseInt(chainIdString)
  );
  return token;
};

const coinIdToChain = (coinId: string) => {
  const [symbol, chainIdString] = coinId.split("-");
  const chain = chains.find((c) => c.chainId === parseInt(chainIdString));
  return chain;
};

export default function AccountOverviewPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  const wallet = data.primaryWallet;

  const isSubmitting = useIsSubmitting("walletForm");

  const { error, getInputProps } = useField("address", {
    formId: "walletForm",
  });
  const coinInput = useField("coins", { formId: "walletForm" });

  return (
    <div className="flex flex-col">
      <CardHeader account={account} />

      <div className="mb-8 pb-4">
        <Link
          to="edit"
          className="rounded bg-slate-600 py-1 px-2 text-xs text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Edit Account
        </Link>
      </div>

      <main className="">
        <div className="rounded-md bg-slate-700 p-6">
          <ValidatedForm validator={validator} method="post" id="walletForm">
            <label htmlFor="address" className="block text-sm font-medium ">
              Wallet Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                {...getInputProps({ id: "address" })}
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-slate-800  bg-slate-800 focus:border-slate-800 focus:ring-slate-800 sm:text-sm"
                placeholder="0x..."
              />
              {error && <p className="p-2 text-xs text-red-300">{error}</p>}
            </div>

            <div>
              {filteredChains.map((chain) => {
                const chainId = chain.chainId;
                const tokensForChain = coinsByChain[chainId] || [];
                return (
                  <fieldset key={chainId} className="mt-8">
                    <div className="" aria-hidden="true">
                      <img
                        src={ethereumLogo}
                        className="inline-block h-8 w-8"
                      />
                      {chain.chainName}
                    </div>
                    <div className="mt-4 flex pl-2">
                      {tokensForChain.map((coin: any) => {
                        const coinId = coin.symbol + "-" + chainId.toString();
                        return (
                          <div key={coinId} className="mr-4 flex items-center">
                            <input
                              defaultChecked={coinSelected(wallet, coinId)}
                              name={`coins`}
                              id={coinId}
                              type="checkbox"
                              value={coinId}
                              className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                            />
                            <label
                              htmlFor={coinId}
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              {coin.symbol}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {coinInput.error && (
                      <p className="p-2 text-xs text-red-300">
                        {coinInput.error}
                      </p>
                    )}
                  </fieldset>
                );
              })}
            </div>

            <div className="mt-4 border-t border-slate-600 pt-4 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </ValidatedForm>
        </div>
      </main>
    </div>
  );
}
