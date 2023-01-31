import * as React from "react";
import { ethers } from "ethers";
import PropTypes from "prop-types";
import { getFaucetAddress } from "@hiropay/tokenlists";

TestnetActions.propTypes = {
  tokens: PropTypes.array.isRequired,
  provider: PropTypes.object.isRequired,
};

export default function TestnetActions(props) {
  const { tokens, provider } = props;

  const addToWallet = (token) => {
    window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image,
        },
      },
    });
  };

  const mint = async (token) => {
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
        {tokens.map((token) => {
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
        {tokens.map((token) => {
          return (
            <button
              size="small"
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
