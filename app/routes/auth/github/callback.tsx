import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export let loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("github", request, {
    successRedirect: "/home",
    failureRedirect: "/failure",
  });
};
