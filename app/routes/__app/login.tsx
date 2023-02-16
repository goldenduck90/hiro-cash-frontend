import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import google from "~/assets/images/google.svg";
import github from "~/assets/images/github.svg";
import twitter from "~/assets/images/twitter.svg";
import metamask from "~/assets/images/wallets/metamask.svg";
import { getWeb3 } from "~/entry.client";
import AppHeader from "~/components/app_header";

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
  const submit = useSubmit();
  async function handleSubmit() {
    const [message, signature] = await getWeb3();
    const formData = new FormData();
    //@ts-ignore
    formData.append("message", message);
    //@ts-ignore
    formData.append("signature", signature);
    submit(formData, {
      action: "/auth/siwe",
      method: "post",
      encType: "application/x-www-form-urlencoded",
      replace: true,
    });
  }
  return (
    <>
      <AppHeader
        title="Register / Sign In"
        description="Create a Hiro payment link and start accepting crypto."
      />
      <div className="text-center">
        <Form action="/auth/twitter" method="post">
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2  font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <img
              src={twitter}
              className="mr-3 h-6 w-6 grayscale"
              aria-hidden="true"
              alt="Twitter Logo"
            />
            Twitter
          </button>
        </Form>
        <Form action="/auth/google" method="post" className="mt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2  font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <img
              src={google}
              className="mr-3 h-6 w-6 grayscale"
              aria-hidden="true"
              alt="Google Logo"
            />
            Google
          </button>
        </Form>
        <Form action="/auth/github" method="post">
          <button
            type="submit"
            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2 font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <img
              src={github}
              className="mr-3 h-6 w-6 grayscale"
              aria-hidden="true"
              alt="Github Logo"
            />
            Github
          </button>
        </Form>
        {/* <button
          onClick={handleSubmit}
          className="mt-4 inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2 font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <img
            src={metamask}
            className="mr-3 h-6 w-6 grayscale"
            aria-hidden="true"
            alt="Metamask Logo"
          />
          Metamask
        </button> */}
      </div>
    </>
  );
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ request }: ActionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/home",
    failureRedirect: "/login",
  });
}

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
export async function loader({ request }: LoaderArgs) {
  // let session = await getSession(request);
  // let error = session.get(authenticator.sessionErrorKey);

  // console.log(error);
  // If the user is already authenticated redirect to /dashboard directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/home",
  });
}
