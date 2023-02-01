import { redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export let loader = () => redirect("/login");

export let action = async ({ request }: ActionArgs) => {
  const response = await authenticator.authenticate("twitter", request, {
    throwOnError: true,
  });
  return response;
};
