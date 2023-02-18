import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import type {
  ActionArgs,
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import invariant from "tiny-invariant";
import { deleteAccount, updateAccount } from "~/models/account.server";
import AccountHeader from "~/components/__home/account_header";
import { validator } from "./new";
import {
  useField,
  useIsSubmitting,
  ValidatedForm,
  validationError,
} from "remix-validated-form";
import { Prisma } from "@prisma/client";
import { mixpanelTrack } from "~/services/mixpanel.server";
import { FOOTER_BUTTON } from "~/styles/elements";

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
  if (!account) {
    return redirect("/home");
  }

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

  if (!account) {
    return redirect("/home");
  }

  // const userId = await requireUserId(request);

  if (request.method === "DELETE") {
    await deleteAccount(account);

    mixpanelTrack(request, oauth, "Account Deleted", {
      username: account.username,
    });

    return redirect("/home");
  } else {
    const result = await validator.validate(await request.formData());
    if (result.error) return validationError(result.error);
    const data = result.data;

    const username = data.username;

    try {
      await updateAccount(account, username);

      mixpanelTrack(request, oauth, "Account Updated", {
        username: username,
      });

      return redirect(`/home`);
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
      <AccountHeader account={account} />

      <main className="h-full ">
        <Link
          to={"/home"}
          className="-mt-4 ml-6 inline-flex items-center rounded-md border border-transparent bg-slate-700 px-4 py-2 pl-2 pr-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ChevronLeftIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />{" "}
          Back
        </Link>
        <div className="p-6">
          <ValidatedForm
            validator={validator}
            method="post"
            id="accountForm"
            defaultValues={account}
          >
            <div className="mt-1 flex rounded-md text-xl shadow-sm">
              <span className="inline-flex items-center rounded-l-md bg-slate-900 py-4 px-3 text-lg text-gray-400">
                http://hiro.cash/
              </span>
              <input
                type="text"
                {...getInputProps({ id: "username" })}
                id="username"
                className="focus:ring-r-0 block w-full min-w-0 flex-1  rounded-none rounded-r-md border-slate-900 bg-slate-900 py-4 text-xl focus:border-slate-900 focus:ring-slate-900"
                placeholder="username"
              />
            </div>
            {error && <p className="p-2 text-xs text-red-300">{error}</p>}
            <div className="mt-4 pt-4 text-center">
              <button
                data-testid="edit-account"
                type="submit"
                disabled={isSubmitting}
                className={FOOTER_BUTTON}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </ValidatedForm>
        </div>

        <Form
          method="delete"
          className="mt-4 border-t border-slate-900 pt-8 text-center"
        >
          <button
            onClick={(event) => {
              if (
                !window.confirm("Do you really want to delete your account?")
              ) {
                event.preventDefault();
              }
            }}
            type="submit"
            className="rounded bg-slate-700 px-10 py-3 py-3 py-1 px-4 text-lg font-medium text-white hover:bg-red-500 active:bg-red-600"
          >
            Delete
          </button>
        </Form>
      </main>
    </div>
  );
}
