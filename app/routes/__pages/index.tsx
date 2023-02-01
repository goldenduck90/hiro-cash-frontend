import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

export async function loader({ request }: LoaderArgs) {
  return json({});
}

export default function PagesMain() {
  return (
    <main className="-mt-32">
      <div className="relative  overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 lg:flex lg:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-2xl lg:pt-8">
            {/* <div className="mt-16 sm:mt-16 lg:mt-16">
              <a href="#" className="inline-flex space-x-6">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-300">
                  <span>Just shipped v1.0</span>
                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </span>
              </a>
            </div> */}
            <h1 className="mt-10 text-4xl font-bold  text-white sm:text-6xl">
              Payments infrastructure for crypto & web3
            </h1>
            <p className="mt-6 text-2xl font-light leading-8 text-gray-400">
              Hiro is a new payment rails that is decentralized, <br />
              permissionless and non-custodial.
            </p>
            {/* <div className="mt-10 flex items-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-500 px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Get started
              </a>
              <a
                href="#"
                className="text-base font-semibold leading-7 text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div> */}
          </div>
          {/* <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="hidden w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
}
