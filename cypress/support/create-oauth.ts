// Use this to create a new oauth and login with that oauth
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-oauth.ts "${provider}" "${userId}"
// and it will log out the cookie value you can use to interact with the server
// as that new oauth.

import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";

import { findOrCreatOauthCredential } from "~/models/oauthCredential.server";
import { createOauthSession } from "~/session.server";

installGlobals();

async function createOauth(provider: string, userId: string) {
  if (!provider) {
    throw new Error("provider required for login");
  }
  if (!userId) {
    throw new Error("userId required for login");
  }

  const credential = await findOrCreatOauthCredential(provider, userId, {});

  const response = await createOauthSession({
    request: new Request("test://test"),
    oAuth: credential,
    remember: false,
    redirectTo: "/",
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createOauthSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(`<cookie>  ${parsedCookie.__session}</cookie>  `.trim());
}

createOauth(process.argv[2], process.argv[3]);
