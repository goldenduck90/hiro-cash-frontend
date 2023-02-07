import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { findFromSession } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const validator = withZod(
  z.object({
    username: z
      .string()
      .min(4, { message: "minimum 4 characters required" })
      .max(15, { message: "maximum 4 characters required" })
      .trim()
      .regex(/a-zA-Z_0-9/, {
        message: "only letters, numbers and underscores",
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
    return redirect(defaultAccount.username);
  } else {
    return redirect("/home/new");
  }
}
