// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";
import { GoogleStrategy } from "remix-auth-google";
import { GitHubStrategy } from "remix-auth-github";
import { TwitterStrategy } from "remix-auth-twitter";
import { SiweStrategy } from "@sloikaxyz/remix-auth-siwe";
import type { OauthCredential } from "@prisma/client";
import { findOrCreatOauthCredential } from "~/models/oauthCredential.server";

const CALLBACK_HOST = process.env.CALLBACK_HOST;

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be provided");
}

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be provided");
}

if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
  throw new Error(
    "TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET must be provided"
  );
}

export type SessionCredential = Pick<
  OauthCredential,
  "id" | "provider" | "userId"
>;

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<SessionCredential>(
  sessionStorage,
  {
    sessionKey: "oAuth", // keep in sync
    sessionErrorKey: "oAuthError", // keep in sync
  }
);

let googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_HOST}/auth/google/callback`,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    try {
      return findOrCreatOauthCredential("google", profile.id, profile);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
);

let githubStrategy = new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: `${CALLBACK_HOST}/auth/github/callback`,
  },
  async ({ accessToken, extraParams, profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    // return User.findOrCreate({ email: profile.emails[0].value });
    try {
      return findOrCreatOauthCredential("github", profile.id, profile);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
);

const twitterStrategy = new TwitterStrategy(
  {
    clientID: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
    callbackURL: `${CALLBACK_HOST}/auth/twitter/callback`,
    // In order to get user's email address, you need to configure your app permission.
    // See https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials.
    includeEmail: true, // Optional parameter. Default: false.
  },
  // Define what to do when the user is authenticated
  async ({ profile }) => {
    console.log(profile);
    // profile contains all the info from `account/verify_credentials`
    // https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials

    // Return a user object to store in sessionStorage.
    // You can also throw Error to reject the login
    // Get the user data from your DB or API using the tokens and profile
    // return User.findOrCreate({ email: profile.emails[0].value });
    try {
      return findOrCreatOauthCredential("twitter", profile.id.toString(), {});
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
);

const siweStrategy = new SiweStrategy(
  { domain: "localhost:3000" },
  async ({ message }) => {
    try {
      return findOrCreatOauthCredential("siwe", message.address, {});
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
);

authenticator.use(twitterStrategy, "twitter");
authenticator.use(githubStrategy, "github");
authenticator.use(googleStrategy, "google");
authenticator.use(siweStrategy, "siwe");
