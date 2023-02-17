import { useEffect, useState } from "react";
import { useConnect } from "wagmi";
import {
  walletConnectConnector,
  walletConnect2Connector,
} from "../constants/connectors";
import { configuredChains } from "../PluginContainer";

import { connectorWalletIcon } from "../view/walletHelper";

export function ConnectWalletDialog() {
  const {
    connect,
    connectAsync,
    connectors,
    isLoading,
    isIdle,
    isError,
    error,
    pendingConnector,
  } = useConnect();
  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    if (isMobile && window.ethereum && window.ethereum.isMetaMask) {
      // connect({ connector: metaMask });
    }
  }, []);

  if (isMobile) {
    const wc1 = walletConnectConnector(configuredChains);
    const wc2 = walletConnect2Connector(configuredChains);

    return (
      <div className="overflow-hidden pt-2">
        <ul className="divide-y divide-slate-900">
          <li
            onClick={() => connectAsync({ connector: wc1 })}
            className="flex items-center px-0 py-3 hover:cursor-pointer hover:bg-slate-700/25 sm:px-6"
          >
            <div className="flex min-w-0 flex-1 items-center ">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={connectorWalletIcon(wc1)}
                  alt=""
                />
              </div>
              <div className="min-w-0 flex-1 px-4">
                <span className="w-full text-left text-lg text-indigo-600">
                  Wallet Connect 1
                </span>
              </div>
            </div>
          </li>
          <li
            onClick={() => connectAsync({ connector: wc2 })}
            className="flex items-center px-0 py-3 hover:cursor-pointer hover:bg-slate-800/90 sm:px-6"
          >
            <div className="flex min-w-0 flex-1 items-center ">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={connectorWalletIcon(wc2)}
                  alt=""
                />
              </div>
              <div className="min-w-0 flex-1 px-4">
                <span className="w-full text-left text-lg text-indigo-600">
                  Wallet Connect 2
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  } else {
    return (
      <>
        <div className="overflow-hidden pt-2">
          <ul className="divide-y divide-slate-900">
            {connectors.map((connector) => (
              <li
                key={connector.id}
                className="flex items-center px-0 py-3 hover:cursor-pointer hover:bg-slate-700/25 sm:px-6"
              >
                <div className="flex min-w-0 flex-1 items-center ">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={connectorWalletIcon(connector)}
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <button
                      type="button"
                      disabled={!connector.ready}
                      onClick={() => connect({ connector })}
                      className="w-full text-left text-lg text-indigo-100"
                    >
                      {connector.name}
                      {(isLoading || isIdle) &&
                        pendingConnector?.id === connector.id &&
                        " (connecting)"}
                    </button>
                    {false &&
                      isError &&
                      pendingConnector?.id === connector.id && (
                        <span>{error?.message}</span>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}
