import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import type {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  findFromSession,
  findOauthCredential,
} from "~/models/oauthCredential.server";
import { getChain, routerlist, tokenlist } from "@hiropay/tokenlists";
import { authenticator } from "~/services/auth.server";

import { useField, ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

import invariant from "tiny-invariant";
import { deleteWallet, updateWallet } from "~/models/wallet.server";
import type { Wallet } from ".prisma/client";
import { useIsSubmitting } from "remix-validated-form";

import ethereumLogo from "~/assets/images/chains/ethereum.svg";
import AccountHeader from "~/components/__home/account_header";
import { mixpanelTrack } from "~/services/mixpanel.server";
import { FOOTER_BUTTON } from "~/styles/elements";

const coins = tokenlist.tokens;

const coinsByChain: any = {};
coins.forEach((c) => {
  if (coinsByChain[c.chainId]) {
    coinsByChain[c.chainId].push(c);
  } else {
    coinsByChain[c.chainId] = [c];
  }
});

const filteredChainIds: number[] = [];
routerlist.routers.forEach((routerInfo) => {
  if (routerInfo.version == "0.1") {
    if (!filteredChainIds.includes(routerInfo.chainId)) {
      filteredChainIds.push(routerInfo.chainId);
    }
  }
});

function coinSelected(wallet: Wallet, coinId: string): boolean {
  const coins: any[] =
    wallet?.config!["coins" as keyof typeof wallet.config] || [];
  return coins.includes(coinId);
}

export const validator = withZod(
  z.object({
    address: z
      .string()
      .min(3, { message: "address is required" })
      .regex(/.*(?<!\.eth)$/, "ENS domain not yet supported coming soon.")
      .regex(/^0[xX][0-9a-fA-F]{40}$/, "must be a valid ethereum address."),
    coins: zfd.repeatable(
      z.array(zfd.text()).min(1, { message: "select at least one coin" })
    ),
  })
);

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
  mixpanelTrack(request, oauth, "Show Wallet", {});
  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  let wallet = account?.wallets.find((wallet) => wallet.id === params.walletId);

  return json({
    oauthCredential: oauth,
    account: account,
    wallet: wallet,
    SHOW_TESTNETS: process.env.SHOW_TESTNETS === "true",
  });
};

export const action: ActionFunction = async ({
  request,
  params,
}: ActionArgs) => {
  const authSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const oauth = await findFromSession(authSession);

  const account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  invariant(account, "account not found");
  const wallet = account?.wallets.find(
    (wallet) => wallet.id === params.walletId
  );
  invariant(wallet, "wallet not found");

  if (request.method === "DELETE") {
    await deleteWallet(wallet);
    return redirect("/home");
  } else {
    const result = await validator.validate(await request.formData());
    if (result.error) return validationError(result.error);
    const data = result.data;

    const address = data["address"];
    await updateWallet(wallet, address, {
      type: params.type,
      exchange: params.exchange,
      config: {
        coins: data["coins"],
      },
    });

    mixpanelTrack(request, oauth, "Wallet Updated", {
      address: address,
      coins: data["coins"],
    });

    return redirect(`../${account.username}`);
  }
};

export default function AccountWalletPage() {
  const data = useLoaderData<typeof loader>();
  const isSubmitting = useIsSubmitting("myForm");
  const SHOW_TESTNETS = data.SHOW_TESTNETS;

  const filteredChains = filteredChainIds
    .map((chainId) => {
      return getChain(chainId);
    })
    .filter((chain) => {
      return chain && (chain.testnet != true || SHOW_TESTNETS);
    });

  const account = data.account;
  const wallet = data.account.wallets[0];

  const { error, getInputProps } = useField("address", { formId: "myForm" });

  // const user = useUser();

  return (
    <div className="flex flex-col">
      <AccountHeader account={account} />

      <main className="">
        <Link
          to={"../"}
          className="-mt-4 ml-6 inline-flex items-center rounded-md border border-transparent bg-slate-700 px-4 py-2 pl-2 pr-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ChevronLeftIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />{" "}
          Back
        </Link>
        <div className="p-6">
          <ValidatedForm validator={validator} method="post" id="myForm">
            <label htmlFor="email" className="block text-sm font-medium ">
              Wallet Address
            </label>
            <div className="mt-1">
              <input
                {...getInputProps({ id: "address" })}
                type="text"
                name="address"
                id="address"
                className="block w-full min-w-0 rounded-md border-slate-800 bg-slate-900 p-3  text-lg focus:border-slate-800 focus:ring-slate-800"
                placeholder="0x..."
                defaultValue={wallet.address}
              />
              {error && <span className="my-error-class">{error}</span>}
            </div>

            {filteredChains.map((chain) => {
              const chainId = chain.chainId;
              const tokensForChain = coinsByChain[chainId] || [];

              return (
                chain && (
                  <fieldset key={chainId} className="mt-8">
                    <div className="" aria-hidden="true">
                      <img
                        src={ethereumLogo}
                        className="inline-block h-8 w-8"
                        alt="Ethereum Logo"
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
                  </fieldset>
                )
              );
            })}
            <div className="mt-4 pt-4 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={FOOTER_BUTTON}
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
