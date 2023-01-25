import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export default function Index() {
  return (
    <main className="relative bg-slate-800">
      <Link
        to="/login"
        className="inline-block rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600"
      >
        Log In or Sign Up
      </Link>
    </main>
  );
}
