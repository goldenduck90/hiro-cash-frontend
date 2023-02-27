import type {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import invariant from "tiny-invariant";
import { createWallet } from "~/models/wallet.server";
import type { Wallet } from "@prisma/client";

import { useField, useIsSubmitting, ValidatedForm } from "remix-validated-form";

import ethereumLogo from "~/assets/images/chains/ethereum.svg";
import { validator } from "./$id.wallet.$walletId";
import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";
import AccountHeader from "~/components/__home/account_header";
import { mixpanelTrack } from "~/services/mixpanel.server";
import { FOOTER_BUTTON } from "~/styles/elements";
import Roadmap from "~/components/roadmap";

const coins = tokenlist.tokens;

export function coinSelected(wallet: Wallet, coinId: string): boolean {
  const coins: any[] =
    wallet?.config!["coins" as keyof typeof wallet.config] || [];
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

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  let authenticatedSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let oauth = await findFromSession(authenticatedSession);
  mixpanelTrack(request, oauth, "New Wallet", {});

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  invariant(account, "account not found");

  const wallet = account.wallets[0];

  return json({
    oauthCredential: oauth,
    account: account,
    primaryWallet: wallet,
    SHOW_TESTNETS: process.env.SHOW_TESTNETS === "true",
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

    const address = data!["address"];
    await createWallet(account, address, {
      type: params.type,
      exchange: params.exchange,
      config: {
        coins: data!["coins"],
      },
    });

    mixpanelTrack(request, oauth, "Wallet Created", {
      address: address,
      coins: data!["coins"],
    });

    return redirect(`/home/${account.username}`);
  }
};

export default function AccountOverviewPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  const wallet = data.primaryWallet;
  const SHOW_TESTNETS = data.SHOW_TESTNETS;

  const filteredChains = filteredChainIds
    .map((chainId) => {
      return getChain(chainId);
    })
    .filter((chain) => {
      // return chain && (SHOW_TESTNETS || !chain.testnet);
      return chain && (chain.testnet != true || SHOW_TESTNETS);
    });

  const isSubmitting = useIsSubmitting("walletForm");

  const { error, getInputProps } = useField("address", {
    formId: "walletForm",
  });
  const coinInput = useField("coins", { formId: "walletForm" });

  return (
    <>
      <AccountHeader account={account} />

      <main className="px-6 pb-8">
        <ValidatedForm validator={validator} method="post" id="walletForm">
          <label htmlFor="address" className="block text-sm font-medium ">
            Wallet Address
          </label>
          <div className="mt-1">
            <input
              data-testid="wallet-address"
              type="text"
              {...getInputProps({ id: "address" })}
              className="block w-full min-w-0 rounded-md border-slate-800 bg-slate-900 p-3  text-lg focus:border-slate-800 focus:ring-slate-800"
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
                      src={chain.logoUri}
                      className="mr-2 inline-block h-6 w-6"
                      alt="Logo"
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

          <div className="mt-8 border-slate-600 pt-4 text-center">
            <button
              data-testid="create-wallet"
              type="submit"
              disabled={isSubmitting}
              className={FOOTER_BUTTON}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </ValidatedForm>
      </main>
      <Roadmap>
        <div className="p-4">
          <div className="relative grid grid-cols-3 gap-4">
            <div className="text-sm">
              <label className="font-medium text-indigo-500">Insta-swap</label>
              <p id="comments-description" className="text-gray-500">
                Senders can pay with any tokens in their wallet.
              </p>
            </div>
            <div className="text-sm">
              <label className="font-medium text-indigo-500">
                Send to Exchange
              </label>
              <p id="comments-description" className="text-gray-500">
                Automatically updated token/chain lists compatible with your
                exchange.
              </p>
            </div>
            <div className="text-sm">
              <label className="font-medium text-indigo-500">
                Multi-Wallets
              </label>
              <p id="comments-description" className="text-gray-500">
                Add more wallets and create individual links for different.
              </p>
            </div>
          </div>
        </div>
      </Roadmap>
    </>
  );
}
