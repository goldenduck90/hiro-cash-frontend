// app/services/session.server.ts
import type { OauthCredential } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

const SESSION_SECRET = process.env.SESSION_SECRET;
invariant(SESSION_SECRET, "SESSION_SECRET must be set");

const USER_SESSION_KEY = "oAuth";

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [SESSION_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// export async function getUserId(
//   request: Request
// ): Promise<OauthCredential["id"] | undefined> {
//   const session = await getSession(request);
//   const userId = session.get(USER_SESSION_KEY);
//   return userId;
// }

// export async function getUser(request: Request) {
//   const userId = await getUserId(request);
//   if (userId === undefined) return null;

//   const user = await getUserById(userId);
//   if (user) return user;

//   throw await logout(request);
// }

// export async function requireUserId(
//   request: Request,
//   redirectTo: string = new URL(request.url).pathname
// ) {
//   const userId = await getUserId(request);
//   if (!userId) {
//     const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
//     throw redirect(`/login?${searchParams}`);
//   }
//   return userId;
// }

// export async function requireUser(request: Request) {
//   const userId = await requireUserId(request);

//   const user = await getUserById(userId);
//   if (user) return user;

//   throw await logout(request);
// }

export async function createOauthSession({
  request,
  oAuth,
  remember,
  redirectTo,
}: {
  request: Request;
  oAuth: OauthCredential;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, oAuth);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// you can also export the methods individually for your own usage
export let { commitSession, destroySession } = sessionStorage;
