import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export let loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("twitter", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
