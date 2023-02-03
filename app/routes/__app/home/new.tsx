import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { CalendarIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { createAccount } from "~/models/account.server";
import { useField, ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { useIsSubmitting } from "remix-validated-form";

export const validator = withZod(
  z.object({
    username: z
      .string()
      .min(4, { message: "username has to be 4 - 15 characters long" })
      .max(15, { message: "username has to be 4 - 15 characters long" })
      .trim()
      .regex(/[a-zA-Z_0-9]*/, {
        message: "username can only contain letters, numbers and underscores",
      }),
  })
);

export async function loader({ request }: LoaderArgs) {
  let userSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let oauth = await findFromSession(userSession);
  const defaultAccount = oauth.accounts[0];

  if (defaultAccount) {
    return redirect("/home");
  } else {
    return json({ oauthCredential: oauth, defaultAccount: defaultAccount });
  }
}

export let action = async ({ request }: ActionArgs) => {
  let userSession = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findFromSession(userSession);

  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const data = result.data;

  const account = await createAccount(oauth, data.username);

  return redirect(`/home/${account.username}`);
};

export default function NewAccountPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.defaultAccount;
  const isSubmitting = useIsSubmitting("accountForm");

  const { error, getInputProps } = useField("username", {
    formId: "accountForm",
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className=""></h1>
        {/* <p>{user.email}</p> */}
      </header>

      <main className=" h-full ">
        <div className="rounded-lg bg-slate-700 bg-opacity-50 p-6 shadow">
          <ValidatedForm validator={validator} method="post" id="accountForm">
            <h2 className="pb-4">Choose your username</h2>
            <div className="mt-1 flex rounded-md text-lg shadow-sm">
              <span className="inline-flex items-center rounded-l-md border border-slate-800 bg-slate-800 px-3 text-sm text-gray-400">
                http://hiro.cash/
              </span>
              <input
                type="text"
                {...getInputProps({ id: "username" })}
                id="username"
                className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-slate-800  bg-slate-800 focus:border-slate-800 focus:ring-slate-800 "
                placeholder="username"
              />
            </div>
            {error && <p className="p-2 text-xs text-red-300">{error}</p>}
            <div className="mt-4 border-t border-slate-600 pt-4 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
