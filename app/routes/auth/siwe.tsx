import type { ActionFunction, ActionArgs, LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

// export let loader = () => redirect("/login");

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  return authenticator.authenticate("siwe", request, {
    successRedirect: "/home",
    failureRedirect: "/failure",
  });
};

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export function loader({ request }: LoaderArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  return authenticator.isAuthenticated(request, {
    successRedirect: "/home",
    failureRedirect: "/failure",
  });
}
