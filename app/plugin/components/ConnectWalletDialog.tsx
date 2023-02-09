import { useConnect } from "wagmi";

import { connectorWalletIcon } from "../view/walletHelper";

export function ConnectWalletDialog() {
  const {
    connect,
    connectors,
    isLoading,
    isIdle,
    isError,
    error,
    pendingConnector,
  } = useConnect();

  return (
    <>
      <div className="overflow-hidden bg-white pt-2">
        <ul className="divide-y divide-blue-300">
          {connectors.map((connector) => (
            <li
              key={connector.id}
              className="flex items-center px-0 py-3 hover:cursor-pointer hover:bg-blue-50 sm:px-6"
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
                    className="w-full text-left text-lg font-bold text-indigo-600"
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
