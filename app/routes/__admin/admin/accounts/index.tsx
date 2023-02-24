// import node_modules
import { format } from "date-fns";

import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

// import models
import {
  findAllAccount,
  findAllAccountPagination,
} from "~/models/account.server";

// import service
import type { Wallet } from "@prisma/client";
import truncateEthAddress from "truncate-eth-address";

const defaultPerpage = 20;
const perPage = defaultPerpage;

export async function loader({ request, params }: LoaderArgs) {
  const perPage: any = defaultPerpage;
  const pageNo: any = params["pageNo"] || 0;

  const accounts = await findAllAccountPagination(
    Number(pageNo * perPage),
    Number(perPage)
  );
  const totalAccount = await findAllAccount();

  return json({
    accounts: accounts,
    totalAccount: totalAccount,
  });
}

export default function AccountsPage() {
  const navigate = useNavigate();
  const { accounts, totalAccount } = useLoaderData<typeof loader>();

  const [pages, setPages] = useState<number>(0);

  useEffect(() => {
    // navigate(`/admin/accounts?perPage=${perPage}&pageNo=${pages}`);
    navigate(`/admin/accounts?&pageNo=${pages}`);
  }, [navigate, pages]);

  return (
    <div className="flex h-full flex-col px-6">
      <div
        className="py-4 text-2xl text-inherit"
        data-testid="admin-account-title"
      >
        Accounts
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className="px-6 py-3"
                data-testid="account-table-header-ID"
              >
                Username
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                data-testid="account-table-header-Address"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-6 py-3"
                data-testid="account-table-header-Token"
              >
                Token
              </th>
              <th scope="col" className="w-32 px-6 py-3">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account: any) => (
              <tr
                className="border-b bg-white text-[12px] dark:border-gray-700 dark:bg-gray-900"
                key={account.id}
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                  data-testid={account.username + "-id"}
                >
                  {account.username}
                </th>
                <td
                  className="px-6 py-4"
                  data-testid={account.username + "-wallet"}
                >
                  {account.wallets.map((wallet: Wallet, index: number) => (
                    <div key={wallet.id}>
                      <Link
                        to={`https://debank.com/profile/${wallet.address}`}
                        target="_blank"
                        data-testid={account.username + "-wallet-" + index}
                      >
                        {truncateEthAddress(wallet.address)}
                      </Link>
                    </div>
                  ))}
                </td>
                <td
                  className="px-6 py-4"
                  data-testid={account.username + "-tokens"}
                >
                  {account.wallets.map((wallet: Wallet) => {
                    const coinIds: any[] =
                      wallet.config!["coins" as keyof typeof wallet.config] ||
                      [];
                    return <div key={wallet.id}>{coinIds.join(", ")}</div>;
                  })}
                </td>
                <td
                  className="px-6 py-4"
                  data-testid={account.username + "-createdAt"}
                >
                  {format(new Date(account.createdAt), "MM-dd HH:mm")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center py-10 px-4 sm:px-6 lg:px-4">
        <div className="flex w-full  items-center justify-end gap-[15px] border-t border-gray-200 dark:border-gray-700 lg:w-full">
          <div
            className="flex cursor-pointer items-center pt-3 text-gray-600  hover:text-indigo-700 dark:text-gray-200"
            onClick={() => {
              setPages(pages > 0 ? pages - 1 : pages);
            }}
          >
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.1665 4H12.8332"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1.1665 4L4.49984 7.33333"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1.1665 4.00002L4.49984 0.666687"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="ml-3 text-sm font-medium leading-none">Previous</p>
          </div>

          <div
            className="flex cursor-pointer items-center pt-3 text-gray-600 hover:text-indigo-700 dark:text-gray-200"
            onClick={() => {
              setPages(
                pages < Math.ceil(totalAccount.length / perPage) - 1
                  ? pages + 1
                  : pages
              );
            }}
          >
            <p className="mr-3 text-sm font-medium leading-none">Next</p>
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.1665 4H12.8332"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 7.33333L12.8333 4"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 0.666687L12.8333 4.00002"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
