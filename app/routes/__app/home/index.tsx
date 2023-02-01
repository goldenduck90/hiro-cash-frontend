import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { CalendarIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { createAccount } from "~/models/account.server";

export async function loader({ request }: LoaderArgs) {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );
  const defaultAccount = oauth.accounts[0];

  return json({ oauthCredential: oauth, defaultAccount: defaultAccount });
}

export let action = async ({ request }: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );

  // const userId = await requireUserId(request);

  const data = await request.formData();
  // Object.fromEntries(data);
  const username = data.get("username");
  const account = await createAccount(oauth, username);

  console.log(account.username);
  return redirect(`/home/${account.username}`);
};

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.defaultAccount;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className="">
          {account && "Home"}
          {!account && "Welcome"}
        </h1>
        {/* <p>{user.email}</p> */}
      </header>

      <main className=" h-full ">
        {!account && (
          <div className="rounded-lg bg-slate-700 bg-opacity-50 p-6 shadow">
            <Form method="post">
              <h2 className="pb-4">Create your account</h2>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Username/handle
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-slate-800 bg-slate-800 px-3 text-gray-400 sm:text-sm">
                  http://hiro.cash/
                </span>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-slate-800  bg-slate-800 focus:border-slate-800 focus:ring-slate-800 sm:text-sm"
                  placeholder="username"
                />
              </div>
              <div className="mt-4 border-t border-slate-600 pt-4 text-right">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create
                </button>
              </div>
            </Form>
          </div>
        )}

        <div className="flex-1 ">
          <div className="overflow-hidden shadow sm:rounded-md">
            {account && (
              <ul role="list" className="divide-y divide-slate-600">
                <li key={account.id}>
                  <Link
                    to={account.username}
                    className="block hover:bg-slate-700"
                  >
                    <div className="flex items-center px-4 py-4 sm:px-6">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="truncate">
                          <div className="flex text-sm">
                            <p className="truncate font-medium text-indigo-600">
                              {account.username}
                            </p>
                            <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                              in {}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon
                                className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                aria-hidden="true"
                              />
                              <p>
                                Created on{" "}
                                <time dateTime={account.createdAt}>
                                  {account.createdAt}
                                </time>
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
