import * as React from "react";
import { ethers } from "ethers";
import type { TokenInfo } from "@hiropay/tokenlists";
import { getFaucetAddress } from "@hiropay/tokenlists";

export default function TestnetActions(props: {
  tokens: TokenInfo[];
  provider: any;
}) {
  const { tokens, provider } = props;

  const addToWallet = (token: {
    address: any;
    symbol: string;
    decimals: number;
  }) => {
    if (window.ethereum) {
      window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      });
    }
    throw new Error("metamask needs to be installed");
  };

  const mint = async (token: TokenInfo) => {
    // Create a JavaScript object from the Contract ABI, to interact
    // with the HelloWorld contract.
    const routerContract = new ethers.Contract(
      getFaucetAddress(token).address,
      ["function requestTokens()"],
      provider.getSigner()
    );

    await routerContract.requestTokens();
  };

  return (
    <>
      <div style={{ backgroundColor: "#ffe", marginTop: 0 }}>
        <span style={{ color: "#555", marginRight: 10 }}>Testnet Faucets:</span>
        {tokens.map((token: TokenInfo) => {
          return (
            <button
              disabled={!getFaucetAddress(token)}
              onClick={() => mint(token)}
              key={token.address}
              className="ml-4"
            >
              {token.symbol}
            </button>
          );
        })}
        <hr />
        <span style={{ color: "#555", marginRight: 10 }}>Add to Wallet:</span>
        {tokens.map((token: TokenInfo) => {
          return (
            <button
              // size="small"
              onClick={() => addToWallet(token)}
              key={token.address}
              className="ml-4"
            >
              {token.symbol}
            </button>
          );
        })}
      </div>
    </>
  );
}
