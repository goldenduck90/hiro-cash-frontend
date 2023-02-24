import { Container, Header, AppContent } from "./header";
// import node_modules
import { json, type LoaderArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

// import models
import {
  authenticateAdmin,
  findOauthCredential,
} from "~/models/oauthCredential.server";

// import service
import { authenticator } from "~/services/auth.server";

export async function loader({ request, params }: LoaderArgs) {
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

export default function AdminLayout() {
  return (
    <Container>
      <Header />
      <AppContent />
    </Container>
  );
}
