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

import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";
import AccountHeader from "~/components/__home/account_header";
import { supportedChainsOfWallet, supportedTokensOfWallet } from "~/helpers";
import { mixpanelTrack } from "~/services/mixpanel.server";

const coins = tokenlist.tokens;

export function coinSelected(wallet: Wallet, coinId: string): boolean {
  const coins: any[] = wallet?.config!["coins" as keyof typeof wallet.config];
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
  mixpanelTrack(request, oauth, "Home", {});

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

export default function AccountOverviewPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  const wallet = data.primaryWallet;

  return (
    <div className="flex flex-col">
      <AccountHeader account={account} />

      <main className="">{wallet && <WalletOverview wallet={wallet} />}</main>
    </div>
  );
}

function WalletOverview({ wallet }: { wallet: Wallet }) {
  const tokens = wallet ? supportedTokensOfWallet(wallet) : [];
  const chains = wallet ? supportedChainsOfWallet(wallet) : [];

  return (
    <div className="flex-1 pb-6">
      <div className="overflow-hidden">
        <h2 className="ml-6 mb-2">Primary Wallet</h2>
        <ul className="">
          <li key={wallet.id}>
            <Link
              to={`wallet/${wallet.id}`}
              className="block hover:bg-slate-700 hover:bg-opacity-30"
            >
              <div className="flex items-center px-4 py-3 sm:px-6">
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
                              return token?.symbol;
                            })
                            .join(", ")}
                        </p>
                        <p>
                          Chains:{" "}
                          {chains.map((c: any) => c.chainName).join(", ")}
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
