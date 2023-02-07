import { LinkIcon } from "@heroicons/react/20/solid";

import { Link } from "@remix-run/react";

export default function CardHeader({ account }) {
  return (
    <header className="mb-4 flex items-center justify-between border-b border-slate-900 bg-slate-800 pl-0 text-white">
      <h1 className="mb-4 font-bold">
        <Link to={"/home"} className="text-2xl font-light">
          @{account.username}
        </Link>

        <br />
        <Link
          to={`/${account.username}`}
          target="_blank"
          className="text-sm font-light text-slate-300"
        >
          https://hiro.cash/{account.username}
        </Link>
        <LinkIcon className="ml-2 inline-block w-4" />
      </h1>
    </header>
  );
}
