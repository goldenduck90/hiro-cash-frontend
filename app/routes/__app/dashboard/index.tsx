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
  const account = oauth.accounts[0]

  return json({ oauthCredential: oauth, account: account });
}


export let action = async ({ request }: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  
  // const userId = await requireUserId(request);

  const data = await request.formData();
  // Object.fromEntries(data);
  const username = data.get("username")

  const account = await createAccount(oauth, username)

  return redirect("/dashboard")
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const oauth = data.oauthCredential;
  // const user = useUser();
  
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className="">

        </h1>
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

      <main className=" h-full ">      
        <div className="p-6 bg-slate-600 rounded shadow">
          <form method="post">
            <label htmlFor="email" className="block text-sm font-medium ">
              Create a new handle
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="username"
                id="username"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder=""
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
          </form>
        </div>

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
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">in {}</p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              <p>
                                Closing on <time dateTime={account.createdAt}>{account.createdAt}</time>
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
