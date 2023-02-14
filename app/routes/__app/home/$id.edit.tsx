import type {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import invariant from "tiny-invariant";
import { deleteAccount, updateAccount } from "~/models/account.server";
import CardHeader from "~/components/__home/card_header";
import { validator } from "./new";
import {
  useField,
  useIsSubmitting,
  ValidatedForm,
  validationError,
} from "remix-validated-form";
import { Prisma } from "@prisma/client";

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
  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );

  return json({ oauthCredential: oauth, account: account });
};

export const action: ActionFunction = async ({
  request,
  params,
}: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );

  let account = oauth.accounts.find(
    (account) => account.username === params.id
  );
  invariant(account, "account not found");

  // const userId = await requireUserId(request);

  if (request.method === "DELETE") {
    await deleteAccount(account);
    return redirect("/home");
  } else {
    const result = await validator.validate(await request.formData());
    if (result.error) return validationError(result.error);
    const data = result.data;

    const username = data.username;

    try {
      await updateAccount(account, username);
      return redirect(`/home}`);
    } catch (e: any) {
      // see: https://github.com/prisma/prisma/issues/12128
      if (e.constructor.name === Prisma.PrismaClientKnownRequestError.name) {
        if (e.code === "P2002") {
          return validationError(
            { fieldErrors: { username: "username already taken" } },
            result.submittedData
          );
        }
      }
      console.error("uncaught prism error", e);
      return validationError(
        { fieldErrors: { username: "something went wrong" } },
        result.submittedData
      );
    }
  }
};

export default function AccountEditPage() {
  const data = useLoaderData<typeof loader>();
  const account = data.account;
  const isSubmitting = useIsSubmitting("accountForm");

  const { error, getInputProps } = useField("username", {
    formId: "accountForm",
  });

  return (
    <div className="flex  flex-col">
      <CardHeader account={account} />

      <main className=" h-full ">
        <div className="rounded-lg bg-slate-700 bg-opacity-50 p-6 shadow">
          <ValidatedForm
            validator={validator}
            method="post"
            id="accountForm"
            defaultValues={account}
          >
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

        <Form method="delete" className="mt-4">
          <button
            type="submit"
            className="rounded bg-slate-600 py-1 px-2 text-xs hover:bg-red-500 active:bg-red-600"
          >
            Delete
          </button>
        </Form>
      </main>
    </div>
  );
}
