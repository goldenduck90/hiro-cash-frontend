import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import google from "~/assets/images/google.svg";
import github from "~/assets/images/github.svg";
import twitter from "~/assets/images/twitter.svg";

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
  return (
    <>
      <div className="text-center">
        <h2 className="pb-6 text-lg">Login to Hiro</h2>
        <Form action="/auth/twitter" method="post">
          <button
            type="submit"
            className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2  font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <img
              src={twitter}
              className="mr-3 h-6 w-6 grayscale"
              aria-hidden="true"
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
            />
            Github
          </button>
        </Form>
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
    successRedirect: "/dashboard",
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
    successRedirect: "/dashboard",
  });
}
