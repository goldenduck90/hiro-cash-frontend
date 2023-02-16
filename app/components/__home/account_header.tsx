import { LinkIcon } from "@heroicons/react/20/solid";
import type { Account } from "@prisma/client";
import { Link } from "@remix-run/react";

export default function AccountHeader({ account }: { account: Account }) {
  return (
    <div className="mb-8 border-b border-slate-900 px-4 py-5 sm:px-6">
      <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 ">
          <h3 className="text-lg font-medium leading-6 text-gray-200">
            <Link to={"/home"} className="text-2xl font-light">
              @{account.username}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            <Link
              to={`/${account.username}`}
              target="_blank"
              className="text-sm font-light text-slate-300"
            >
              https://hiro.cash/{account.username}
            </Link>
            <LinkIcon className="ml-2 inline-block w-4" />
          </p>
        </div>
        <div className="ml-4 mt-4 flex-shrink-0">
          <Link
            to={`/home/${account.username}/edit`}
            className="relative inline-flex items-center rounded-md border border-transparent bg-slate-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit Account
          </Link>
        </div>
      </div>
    </div>
  );
}
