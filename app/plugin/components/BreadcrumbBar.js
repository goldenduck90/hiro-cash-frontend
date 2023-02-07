import * as React from "react";
import { usePayment } from "../hooks";
import {
  CubeTransparentIcon,
  CurrencyYenIcon,
  CheckBadgeIcon,
} from "@heroicons/react/20/solid";

export default function BreadcrumbBar(props) {
  const { state } = usePayment();

  const chain = state.context.chain;
  const tokenInfo = state.context.balance?.tokenInfo;

  const tabs = [
    {
      name: chain ? chain.chainName : "Choose Chain",
      href: "#",
      icon: CubeTransparentIcon,
      selectedIconURI: chain?.logoUri,
      current: state.matches("connected.no_chain"),
    },
    {
      name: tokenInfo ? tokenInfo.symbol : "Choose Token",
      href: "#",
      icon: CurrencyYenIcon,
      selectedIconURI: tokenInfo?.logoUri,
      current: state.matches("connected.no_token"),
    },
    {
      name: "Confirm",
      href: "#",
      icon: CheckBadgeIcon,
      current: state.matches("connected.ready"),
    },
    {
      name: "Completed",
      href: "#",
      icon: CheckBadgeIcon,
      current: state.matches("connected.completed"),
    },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }
  return (
    <div>
      <div className="sm:hidden ">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          defaultValue={tabs.find((tab) => tab.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.current
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                {tab.selectedIconURI && (
                  <img
                    className="-ml-0.5 mr-2 h-6 w-6 rounded-full"
                    src={tab.selectedIconURI}
                    alt="Slected Icon"
                  />
                )}
                {!tab.selectedIconURI && (
                  <tab.icon
                    className={classNames(
                      tab.current
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "-ml-0.5 mr-2 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                )}
                <span>{tab.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
