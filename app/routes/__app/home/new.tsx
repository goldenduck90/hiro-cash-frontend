import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { createAccount } from "~/models/account.server";
import { useField, ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { useIsSubmitting } from "remix-validated-form";
import { Prisma } from "@prisma/client";
import { mixpanelTrack } from "~/services/mixpanel.server";
import AppHeader from "~/components/app_header";
import { FOOTER_BUTTON } from "~/styles/elements";
import Roadmap from "~/components/roadmap";
import zapier from "~/assets/images/logos/zapier.svg";

export const validator = withZod(
  z.object({
    username: z
      .string()
      .min(4, { message: "username has to be 4 - 15 characters long" })
      .max(15, { message: "username has to be 4 - 15 characters long" })
      .trim()
      .regex(/[a-zAZ_0-9]*/, {
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

  mixpanelTrack(request, oauth, "New Account", {});

  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const data = result.data;

  try {
    const account = await createAccount(oauth, data.username);

    mixpanelTrack(request, oauth, "Account Created", {
      username: account.username,
    });

    return redirect(`/home/${account.username}`);
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
    console.log(e);
    return validationError(
      { fieldErrors: { username: "something went wrong" } },
      result.submittedData
    );
  }
};

export default function NewAccountPage() {
  const isSubmitting = useIsSubmitting("accountForm");

  const { error, getInputProps } = useField("username", {
    formId: "accountForm",
  });

  return (
    <div className="flex h-full flex-col">
      <AppHeader title="Choose Your Username" />

      <main className=" h-full ">
        <div className="rounded-lg p-6">
          <ValidatedForm validator={validator} method="post" id="accountForm">
            <div className="mt-1 flex rounded-md text-xl shadow-sm">
              <span className="inline-flex items-center rounded-l-md bg-slate-900 py-4 px-3 text-lg text-gray-400">
                http://hiro.cash/
              </span>
              <input
                data-testid="username"
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
                data-testid="create-account"
                type="submit"
                disabled={isSubmitting}
                className={FOOTER_BUTTON}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </ValidatedForm>
        </div>
        <Roadmap>
          <div className="p-4">
            <div className="relative grid grid-cols-3 gap-4">
              <div className="text-sm">
                <label className="font-medium text-indigo-500">
                  Realtime Notifications
                </label>
                <p id="comments-description" className="text-gray-500">
                  Get Email, SMS, push when you receive a payment.
                </p>
              </div>
              <div className="text-sm">
                <label className="font-medium text-indigo-500">
                  Webhooks & Zapier
                </label>
                <p id="comments-description" className="text-gray-500">
                  Automatically update Quickbooks, Xero, etc.
                </p>
              </div>
              <div className="text-sm">
                <label className="font-medium text-indigo-500">
                  Multiple Usernames
                </label>
                <p id="comments-description" className="text-gray-500">
                  For your alt accounts.
                </p>
              </div>
            </div>
          </div>
        </Roadmap>
      </main>
    </div>
  );
}
