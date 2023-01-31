//@ts-check
// These functions are in a separate module so they can easily be mocked
import { ethers, utils } from "ethers";
import { abis } from "@hiropay/tokenlists";

import {
  getErc20Contract,
  getRouterContract,
  parseAmountInMinorForComparison,
  getPriceFeeds,
} from "~/plugin/utils";

/**
 * Returns balances
 *
 * @param {*} tokens
 * @param {*} signer
 * @returns
 */
export const getBalances = (tokens, signer) => {
  return new Promise((resolve, reject) =>
    signer
      .getAddress()
      .then((signerAddress) =>
        Promise.all(
          tokens.map((t) => {
            const contract = getErc20Contract(t.address, signer);
            const balance = {
              tokenInfo: t,
              contract: contract,
              balance: null,
              allowance: ethers.BigNumber.from("-1"),
            };
            return contract
              .balanceOf(signerAddress)
              .then((b) => {
                return Object.assign(balance, { balance: b });
              })
              .catch((e) => {
                // Error cases:
                // - a token.address is NOT pointing to a ERC20 contract. E.g. an EOA or another
                // smart contract
                // TODO: find a better way, so that the frontend can filter these tokens out,
                //      as a last line of defence (e.g. token.error = true)
                return Object.assign(balance, {
                  balance: ethers.BigNumber.from("-1"),
                });
              });
          })
        )
          .then((tokens) => resolve(tokens))
          .catch((e) => {
            reject(e);
          })
      )
      .catch((e) => {
        reject(e);
      })
  );
};

export const getAllowance = (context, event) =>
  new Promise((resolve, reject) => {
    context.balance.contract
      .allowance(context.walletAddress, context.chain.router)
      .then((a) => {
        context.balance.allowance = a;
        resolve(a);
      })
      .catch((e) => {
        reject(e);
      });
  });

export const increaseAllowance = (context, event) =>
  new Promise((resolve, reject) => {
    const maxAllowance = ethers.constants.MaxUint256;

    context.balance.contract
      .approve(context.chain.router, maxAllowance)
      .then((tx) => {
        tx.wait()
          .then((receipt) => {
            context.balance.allowance = maxAllowance;
            resolve(context.balance.allowance);
          })
          .catch((e) => {
            reject(e);
          });
      })
      .catch((e) => {
        reject(e);
      });
  });

export function paymentPayload(context) {
  const invoice = context.invoice;
  const token = context.balance.tokenInfo;

  const amount = parseAmountInMinorForComparison(
    invoice.amountInMinor.toString(),
    token.decimals
  );

  let extraFeeAddress;
  if (invoice.extraFeeAddress === "FEE_TREASURY") {
    // use a mulitisig owner as a fallback in case feeTreasury nil.
    const FALLBACK_ADDRESS = "0x6b813ABF97bc51b8A0e04d6ec974A20663Fd6Bf1";
    extraFeeAddress = context.chain.feeTreasury || FALLBACK_ADDRESS;
  } else if (invoice.extraFeeAddress != ethers.constants.AddressZero) {
    extraFeeAddress = invoice.extraFeeAddress;
  } else {
    extraFeeAddress = ethers.constants.AddressZero;
  }

  const priceFeeds = getPriceFeeds(context.chain, invoice.currency, token);

  return [
    utils.formatBytes32String(invoice.memo ? invoice.memo : ""),
    amount.toString(),
    priceFeeds,
    token.address,
    invoice.merchantAddress,
    extraFeeAddress || ethers.constants.AddressZero,
    invoice.extraFeeDivisor || 0,
  ];
}

export const pay = (context, _event) =>
  new Promise((resolve, reject) => {
    const payload = paymentPayload(context);
    const router = getRouterContract(context.chain.router, context.signer);

    router
      .payWithToken(...payload)
      .then((tx) =>
        tx
          .wait()
          .then((receipt) => {
            resolve(receipt);
          })
          .catch((e) => reject(e))
      )
      .catch((e) => reject(e));
  });
