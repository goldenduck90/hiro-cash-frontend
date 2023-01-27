import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { createAccount, findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

export default function WalletLayout() {
  return (
    <Outlet />
  );
}
