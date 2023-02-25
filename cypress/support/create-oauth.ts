// Use this to create a new oauth and login with that oauth
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-oauth.ts "${provider}" "${userId}"
// and it will log out the cookie value you can use to interact with the server
// as that new oauth.

import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";
import { faker } from "@faker-js/faker";
import { findOrCreatOauthCredential } from "~/models/oauthCredential.server";
import { createOauthSession } from "~/services/session.server";

installGlobals();

async function createAndLogin(provider: string, userId: string, email: string) {
  if (!provider) {
    throw new Error("provider required for login");
  }
  if (!userId) {
    throw new Error("userId required for login");
  }
  if (!email) {
    throw new Error("email required for login");
  }

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const profile = {
    id: userId,
    name: {
      givenName: firstName,
      familyName: lastName,
    },
    _json: {
      sub: userId,
      name: firstName + " " + lastName,
      email: email,
      locale: "en",
      picture:
        "https://lh3.googleusercontent.com/a/AEdFTp4fJ-uaSNk5T8RVzMuz0m60P0kxrEUsuSAGYKG-ag=s96-c",
      given_name: firstName,
      family_name: lastName,
      email_verified: true,
    },
    emails: [{ value: email }],
    photos: [
      {
        value:
          "https://lh3.googleusercontent.com/a/AEdFTp4fJ-uaSNk5T8RVzMuz0m60P0kxrEUsuSAGYKG-ag=s96-c",
      },
    ],
    provider: provider,
    displayName: firstName + " " + lastName,
  };
  const credential = await findOrCreatOauthCredential(provider, userId, {
    ...profile,
  });

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
  console.log(
    `
    <cookie>
      ${parsedCookie.__session}
    </cookie>
  `.trim()
  );
}

createAndLogin(process.argv[2], process.argv[3], process.argv[4]);
