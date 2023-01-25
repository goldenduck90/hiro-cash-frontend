import type { ActionFunction, LoaderArgs, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { createAccount, createWallet, deleteAccount, findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import invariant from "tiny-invariant";

export const loader: LoaderFunction = async ({ request, params }: LoaderArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  let account = oauth.accounts.find((account) => account.username === params.id )

  return json({ oauthCredential: oauth, account: account });
}

export const action: ActionFunction = async ({ request, params }: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  
  console.log(params)
  let account = oauth.accounts.find((account) => account.username === params.id )

  invariant(account, "account not found");
  console.log(request);
  
  if (request.method === "DELETE") {
      await deleteAccount(account);
      return redirect("/dashboard");
  } else {

    // const userId = await requireUserId(request);

    const data = await request.formData();
    console.log( Object.fromEntries(data) );
    
    const address = data.get("address")
    const wallet = await createWallet(account, address)

    return redirect(".")
  }
}


export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const oauth = data.oauthCredential;
  const account = data.account;
  // const user = useUser();
  
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-xl font-bold">
          {account.username}
        </h1>

        <Form method="delete">
          <button
            title={`${oauth.provider}/@${oauth.profile.displayName}`}
            type="submit"
            className="rounded text-xs bg-slate-600 py-1 px-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Delete
          </button>
        </Form>

        {/* <p>{user.email}</p> */}
        <Form action="/auth/logout" method="post">
          <button
            title={`${oauth.provider}/@${oauth.profile.displayName}`}
            type="submit"
            className="rounded text-xs bg-slate-600 py-1 px-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="h-full">      
        <div className="p-6 bg-slate-700">
          <Form method="post">
            <label htmlFor="email" className="block text-sm font-medium ">
              Wallet Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0x..."
              />              
            </div>
            <div className="mt-1">
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create
              </button>
            </div>
          </Form>
        </div>
        <div className="flex-1 p-6">
          <div className="overflow-hidden shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-slate-600">
              {account.wallets.map((wallet) => {
                return (<li key={wallet.id}>
                  <a href="#" className="block hover:bg-slate-700">
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="truncate font-medium text-indigo-600">{wallet.address}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">in {}</p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <p>
                                Closing on <time dateTime={wallet.createdAt}>{wallet.createdAt}</time>
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
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </a>
                </li>
                );
              })}          
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
