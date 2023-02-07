import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(
    oauthCredential.provider,
    oauthCredential.userId
  );

  return json({ oauthCredential: oauth });
}

export default function HomePage() {
  return (
    <div className="flex h-full flex-col">
      <Outlet />
    </div>
  );
}
