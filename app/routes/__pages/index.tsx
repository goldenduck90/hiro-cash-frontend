import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

import sb from "~/assets/images/pages/sb.jpg";
import ms from "~/assets/images/pages/ms.jpg";
import bb from "~/assets/images/pages/bb.jpg";
import ah from "~/assets/images/pages/ah.jpg";
import { PrimaryFeatures } from "~/components/__pages/PrimaryFeatures";
import { Faq } from "~/components/__pages/Faq";

const features = [
  {
    name: "Lowest fees",
    description: "Free for P2P. 0.20% for B2C payments.",
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

const people = [
  {
    name: "Sebastian Burkhard",
    role: "Payments Maestro",
    imageUrl: sb,
    linkedinUrl: "https://www.linkedin.com/in/sebastian-b-4235233/",
  },
  {
    name: "Markus Steffen",
    role: "Legal & Compliance",
    imageUrl: ms,
    linkedinUrl: "https://www.linkedin.com/in/markus-steffen-b9131755/",
  },
  {
    name: "Bryan Berry",
    role: "Dev",
    imageUrl: bb,
    linkedinUrl: "https://www.linkedin.com/in/bryanwb/",
  },
  {
    name: "Alice Huang",
    role: "Growth & Community",
    imageUrl: ah,
    linkedinUrl: "https://www.linkedin.com/in/hecila/",
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
          <div className="sm:text-leftlg:mx-0 mx-auto max-w-2xl flex-shrink-0 pt-24 text-center lg:max-w-2xl lg:pt-8">
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
            <h1 className="mt-10  text-4xl font-bold text-white  sm:text-6xl">
              Payments infrastructure for crypto & web3
            </h1>
            <p className="mt-6 text-2xl font-light leading-8 text-gray-400">
              Hiro is a next-generation payment rails, that combines the best
              parts of crypto/web3 and traditional payment systems.
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
        <PrimaryFeatures />
        <Faq />

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
        {/* PEOPLE */}

        <div className="bg-gray-900">
          <div className="mx-auto max-w-7xl py-12 px-6 lg:px-8 lg:py-24">
            <div className="space-y-12">
              <div className="space-y-5 text-center sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Team
                </h2>
                <p className="text-xl text-gray-300">
                  Industry veterans in payments, crypto regulations, DeFi and
                  Web3.
                </p>
              </div>
              <ul className="grid grid-cols-2 sm:space-y-0 lg:grid-cols-4 lg:gap-2">
                {people.map((person) => (
                  <li
                    key={person.name}
                    className="rounded-lg py-10 px-6 text-center xl:px-10 xl:text-left"
                  >
                    <div className="space-y-4">
                      <img
                        className="mx-auto h-24 w-24 rounded-full "
                        src={person.imageUrl}
                        alt=""
                      />
                      <div className="">
                        <div className="space-y-1 text-center text-lg font-medium leading-6">
                          <h3 className="text-white">{person.name}</h3>
                          <p className="text-indigo-400">{person.role}</p>
                        </div>
                      </div>
                      <ul className="flex justify-center space-x-5">
                        <li>
                          <a
                            href={person.linkedinUrl}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <span className="sr-only">LinkedIn</span>
                            <svg
                              className="h-5 w-5"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
