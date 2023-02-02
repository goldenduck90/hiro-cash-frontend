import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import {
  CalendarIcon,
  ChevronRightIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import invariant from "tiny-invariant";
import { deleteAccount } from "~/models/account.server";
import { createWallet } from "~/models/wallet.server";
import type { Wallet } from "@prisma/client";

import truncateEthAddress from "truncate-eth-address";
import type { ChainInfo, TokenInfo } from "@hiropay/tokenlists";
import { chainlist } from "@hiropay/tokenlists";
import { tokenlist } from "@hiropay/tokenlists";
import { getTokens } from "@hiropay/tokenlists";

import {
  useField,
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

import ethereumLogo from "~/assets/images/chains/ethereum.svg";
import { validator } from "./$id.wallet";
import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";

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
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );
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
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  if (!account) return redirect(".");
  invariant(account, "account not found");

  if (request.method === "DELETE") {
    await deleteAccount(account);
    return redirect("/home");
  } else {
    // const userId = await requireUserId(request);

    const wallet = account.wallets.find((w) => w.primary === true);
    if (wallet) {
      return redirect(".");
    } else {
      const result = await validator.validate(await request.formData());
      // if (result.error) return validationError(result.error);
      const data = result.data;

      console.log(data);

      const address = data["address"];
      await createWallet(account, address, {
        type: params.type,
        exchange: params.exchange,
        config: {
          coins: data["coins"],
        },
      });

      return redirect(".");
    }
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

  return (
    <div className="flex  flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 pl-0 text-white">
        <h1 className="font-bold">
          <span className="font-medium">Account</span>
          <br />
          <Link
            to={`/${account.username}`}
            target="_blank"
            className="text-sm font-light"
          >
            https://hiro.cash/{account.username}
          </Link>
          <LinkIcon className="ml-2 inline-block w-4" />
        </h1>
        <Link
          to="edit"
          className="rounded bg-slate-600 py-1 px-2 text-xs text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Edit
        </Link>
      </header>

      <main className="">
        {wallet && <WalletOverview wallet={wallet} />}
        {!wallet && (
          <div className="rounded-md bg-slate-700 p-6">
            <ValidatedForm validator={validator} method="post">
              <label htmlFor="address" className="block text-sm font-medium ">
                Wallet Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-slate-800  bg-slate-800 focus:border-slate-800 focus:ring-slate-800 sm:text-sm"
                  placeholder="0x..."
                />
              </div>

              <div>
                {filteredChains.map((chain) => {
                  console.log(chain);
                  const chainId = chain.chainId;
                  const tokensForChain = coinsByChain[chainId] || [];
                  console.log(chainId);

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
                          console.log(coinId);
                          return (
                            <div
                              key={coinId}
                              className="mr-4 flex items-center"
                            >
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
                    </fieldset>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-600 pt-4 text-right">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create
                </button>
              </div>
            </ValidatedForm>
          </div>
        )}
      </main>
    </div>
  );
}

function WalletOverview({ wallet }) {
  const coinIds = wallet?.config["coins"] || [];
  const tokens: TokenInfo[] = coinIds.map(coinIdToToken);
  const chains = [...new Set(coinIds.map(coinIdToChain))];

  return (
    <div className="flex-1 pb-6">
      <div className="overflow-hidden shadow sm:rounded-md">
        <h2>Primary Wallet</h2>
        <ul role="list" className="divide-y divide-slate-600">
          <li key={wallet.id}>
            <Link
              to={`wallet/${wallet.id}`}
              className="block hover:bg-slate-700"
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="truncate font-medium text-indigo-300">
                        {truncateEthAddress(wallet.address)}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        {" "}
                        {}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className=" items-center text-sm text-gray-500">
                        <p>
                          Tokens:{" "}
                          {tokens
                            .map((token) => {
                              return token.symbol;
                            })
                            .join(", ")}
                        </p>
                        <p>
                          Chains: {chains.map((c) => c.chainName).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                    <div className="flex -space-x-1 overflow-hidden">
                      {/* {position.applicants.map((applicant) => (
                              <img
                                key={applicant.email}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                src={applicant.imageUrl}
                                alt={applicant.name}
                              />
                            ))} */}
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
