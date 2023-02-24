// import node_modules
import { type LoaderArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  return redirect("/admin/accounts");
}
