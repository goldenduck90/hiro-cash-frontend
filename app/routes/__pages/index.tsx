import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { findOauthCredential } from "~/models/oauthCredential.server";
import { authenticator } from "~/services/auth.server";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Lowest fees",
    description: "Hiro network charges 0.20% for B2C payments. Free for P2P. ",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Airdrops not cashback",
    description:
      "Leave the 1% cashbacks to the boomers. 51% of HIRO tokens goes to merchants, users and referrals.",
    icon: LockClosedIcon,
  },
  {
    name: "Crypto native",
    description: "Fully decentralized, permissionless and non-custodial. ",
    icon: ArrowPathIcon,
  },
  {
    name: "Full Optionality",
    description: "Works with any chain, any wallet, any token, any exchange.",
    icon: FingerPrintIcon,
  },
];

export async function loader({ request }: LoaderArgs) {
  return json({});
}

export default function PagesMain() {
  return (
    <main className="-mt-32">
      <div className="relative  overflow-hidden">
        <div className="mx-auto h-screen max-w-7xl px-6 pb-24 sm:pb-32 lg:flex lg:py-40 lg:px-8">
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
              Hiro is a next-generation payment rails, that combines the best
              parts of crypto/web3 and VISA/MasterCard.
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

        {/* FEATURES  */}

        <div className="-mt-32 bg-slate-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              {/* <h2 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">
                Deploy faster
              </h2> */}
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-300 sm:text-4xl">
                Better way to send & receive money.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-200">
                With Hiro Links you can easily send&receive money from friends
                or businesses.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-300">
                      <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <feature.icon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-200">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
