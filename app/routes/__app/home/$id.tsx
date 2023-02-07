import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import invariant from "tiny-invariant";
import type { Wallet } from "@prisma/client";

import truncateEthAddress from "truncate-eth-address";
import type { TokenInfo } from "@hiropay/tokenlists";
import { chainlist } from "@hiropay/tokenlists";

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

  if (wallet) {
    return json({
      oauthCredential: oauth,
      account: account,
      primaryWallet: wallet,
    });
  } else {
    return redirect("wallet/new");
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
  const [chainIdString] = coinId.split("-");
  const chain = chains.find((c) => c.chainId === parseInt(chainIdString));
  return chain;
};

export default function AccountOverviewPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  const wallet = data.primaryWallet;

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

      <main className="">{wallet && <WalletOverview wallet={wallet} />}</main>
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
        <ul className="divide-y divide-slate-600">
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
