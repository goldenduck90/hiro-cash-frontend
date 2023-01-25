import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { createAccount, findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderArgs) {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  // const userId = await requireUserId(request);

  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  
  return json({ oauthCredential: oauth });
}


export let action = async ({ request }: ActionArgs) => {
  let oauthCredential = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });  
  let oauth = await findOauthCredential(oauthCredential.provider, oauthCredential.userId);
  
  // const userId = await requireUserId(request);

  const data = await request.formData();
  // Object.fromEntries(data);
  const username = data.get("username")

  const account = await createAccount(oauth, username)

  return redirect("/dashboard")
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const oauth = data.oauthCredential;
  // const user = useUser();
  
  return (
    <div className="flex h-full min-h-screen flex-col">
      <Outlet />
    </div>
  );
}
