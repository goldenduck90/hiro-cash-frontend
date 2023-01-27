import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import twitter from "~/assets/images/twitter.svg";
import github from "~/assets/images/github.svg";
import { findAccount } from "~/models/account.server";
import truncateEthAddress from "truncate-eth-address";
import wallet from "./dashboard/wallet";
import invariant from "tiny-invariant";

export async function loader({ request, params }: LoaderArgs) {  
  const account = await findAccount(params.username);
  const wallet = account.wallets[0]

  invariant(wallet, "no wallet configured");
  
  return json({ 
    account: account,
    wallet: wallet
  });
}

export default function HiroLinkPage() {  
  const {account, wallet} = useLoaderData<typeof loader>();
  
  return (
    <div className="flex h-full flex-col">
      <span className="font-mono text-xl">@{account.username}</span>
      <p className="mt-2">
        <img src={twitter} className="inline-block mt-2 h-4 w-4 grayscale" aria-hidden="true" /> 
        <span className="font-mono text-sm">@{account.username}</span>
      </p>

      <p>
        Address: <span className="font-mono text-sm">{wallet.address}</span>
      </p>

        <div className="w-60 text-xl relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-900">$</span>
            </div>
            <input
              name="amount"
              autoFocus={true}
              placeholder=""
              className="block text-xl w-full rounded-md pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500"              
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <label htmlFor="currency" className="sr-only">
                Currency
              </label>
              <select
                id="baseCurrency"
                name="baseCurrency"
                className="text-xl w-24 h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-gray-800 focus:border-indigo-500 focus:ring-indigo-500"                
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
    </div>
  );
}

