import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { createAccount, findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/20/solid'


export async function loader({ request }: LoaderArgs) {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  const defaultAccount = oauth.accounts[0]

  return json({ oauthCredential: oauth, defaultAccount: defaultAccount });
}



export default function AllPage() {
  const data = useLoaderData<typeof loader>();
  const oauth = data.oauthCredential;
  const defaultAccount = data.defaultAccount;
  
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className="">
          All Hiro Links
        </h1>
        {/* <p>{user.email}</p> */}
      </header>

      <main className=" h-full ">
        <div className="flex-1 ">
          <div className="overflow-hidden shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-slate-600">
              {oauth.accounts.map((account) => {
                return (<li key={account.id}>
                  <Link to={account.username} className="block hover:bg-slate-700">
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="truncate font-medium text-indigo-600">{account.username}</p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500"></p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <p>
                                Created on <time dateTime={account.createdAt}>{account.createdAt}</time>
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
                  </Link>
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
