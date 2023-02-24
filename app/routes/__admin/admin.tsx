// import node_modules
import { json, type LoaderArgs, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

// import models
import {
  authenticateAdmin,
  findOauthCredential,
} from "~/models/oauthCredential.server";

// import service
import { authenticator } from "~/services/auth.server";

export async function action({ request, params }: LoaderArgs) {
  let session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  let adminOauth = await authenticateAdmin(session);

  if (adminOauth) {
    // Authenticated
    return json({ oauthCredential: adminOauth });
  } else {
    // Not Authenticated
    return redirect("/");
  }
}

export default function AdminPage() {
  return (
    <div className="flex h-full flex-col bg-slate-800">
      <Outlet />
    </div>
  );
}
