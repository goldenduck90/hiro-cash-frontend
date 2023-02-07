import { assign, createMachine } from "xstate";
import {
  getBalances,
  getAllowance,
  increaseAllowance,
  pay,
} from "~/plugin/machines/services";
import { getChainById } from "~/plugin/constants/Chains";
import {
  getRouterContract,
  parseAmountInMinorForComparison,
} from "~/plugin/utils";

export const createPaymentMachine = (invoice) => {
  const memo = invoice.memo;

  return createMachine(
    {
      id: `payment-${memo}`,
      initial: "disconnected",
      strict: true,
      context: {
        // initially only invoice is given:
        invoice: invoice,
        // once wallet is connected:
        signer: null,
        walletAddress: null,
        // balances of chain.tokens
        balances: [],
        // user selected chain:
        chain: null,
        // user selected balance/token:
        balance: null,
        // payment case:
        error: null,

        tx: null,
      },
      states: {
        disconnected: {
          always: {
            target: "connected",
            cond: (context, event) => !!context.signer,
          },
          on: {
            CONNECT: {
              target: "connected",
              actions: "assignAccountsAndProvider",
            },
          },
        },
        connected: {
          initial: "no_chain",
          on: {
            DISCONNECT: {
              target: "disconnected",
              actions: "resetAfterDisconnect",
            },
          },
          states: {
            no_chain: {
              initial: "awaiting_input",
              always: [
                {
                  target: "ready",
                  cond: (context, event) => context.chain && context.balance,
                },
                {
                  target: "no_token",
                  cond: (context, event) => !!context.chain,
                },
              ],
              on: {
                SELECT_CHAIN: {
                  target: ".selecting_chain",
                },
              },
              states: {
                awaiting_input: {},
                selecting_chain: {
                  invoke: {
                    id: "selectChain",
                    src: "selectChain",
                    onDone: {
                      target: "..no_token",
                      actions: "assignChain",
                    },
                  },
                },
              },
            },
            no_token: {
              initial: "fetching_balances",
              on: {
                SELECT_TOKEN: { target: ".selecting_token" },
              },
              always: [
                {
                  target: "#ready",
                  cond: (ctx) => {
                    const balanceSufficient =
                      ctx.balance &&
                      ctx.balance.balance.gte(
                        parseAmountInMinorForComparison(
                          ctx.invoice.amountInMinor.toString(),
                          ctx.token.decimals
                        )
                      );
                    return !!balanceSufficient;
                  },
                },
              ],
              states: {
                fetching_balances: {
                  invoke: {
                    id: "fetchBalances",
                    src: "fetchBalances",
                    onDone: {
                      target: "awaiting_input",
                      actions: ["assignBalances"],
                    },
                  },
                },
                awaiting_input: {},
                selecting_token: {
                  invoke: {
                    id: "selectToken",
                    src: "selectToken",
                    onDone: {
                      target: "#ready",
                      actions: ["assignToken"],
                    },
                  },
                },
              },
            },
            ready: {
              id: "ready",
              initial: "check_approval",
              states: {
                check_approval: {
                  initial: "checking",
                  states: {
                    checking: {
                      invoke: {
                        id: "checkAllowance",
                        src: "getAllowance",
                        onDone: {
                          target: "allowance_updated",
                        },
                      },
                    },
                    allowance_updated: {
                      always: [
                        {
                          target: "#allowance_sufficient",
                          cond: "allowanceSufficient",
                        },
                        {
                          target: "#allowance_insufficient",
                          cond: "allowanceInsufficient",
                        },
                      ],
                    },
                    increasing_allowance: {
                      invoke: {
                        id: "increaseAllowance",
                        src: "increaseAllowance",
                        onDone: {
                          target: "allowance_updated",
                        },
                        onError: {
                          target: "#allowance_insufficient",
                          actions: assign({
                            error: (ctx, evt) => {
                              return evt.data;
                            },
                          }),
                        },
                      },
                    },
                  },
                },
                allowance_insufficient: {
                  id: "allowance_insufficient",
                  on: {
                    INCREASE_ALLOWANCE: {
                      target: "check_approval.increasing_allowance",
                    },
                  },
                },
                allowance_sufficient: {
                  id: "allowance_sufficient",
                  initial: "awaiting_input",
                  on: {
                    PAY: { target: ".paying" },
                    exit: assign({ error: (ctx, evt) => null }),
                  },
                  states: {
                    awaiting_input: {},
                    paying: {
                      invoke: {
                        id: "pay",
                        src: "pay",
                        onDone: {
                          target: "#completed",
                          actions: assign({ tx: (ctx, evt) => evt.data }),
                        },
                        onError: {
                          target: "failed",
                          actions: assign({
                            error: (ctx, evt) => {
                              console.error(evt.data);
                              return evt.data;
                            },
                          }),
                        },
                      },
                    },
                    failed: {},
                  },
                },
              },
            },
            failed: {},
            completed: {
              id: "completed",
              type: "final",
            },
          },
        },
      },
    },
    {
      guards: {
        // TODO: DRYed allowanceSufficient/Insufficient
        allowanceSufficient: (
          { invoice: { amountInMinor }, balance },
          _evt
        ) => {
          if (!balance || !amountInMinor) {
            return undefined;
          }

          const reqTokenAmount = parseAmountInMinorForComparison(
            amountInMinor.toString(),
            balance.tokenInfo.decimals
          );
          if (!reqTokenAmount) return false;

          return balance.allowance.gte(reqTokenAmount);
        },
        allowanceInsufficient: (
          { invoice: { amountInMinor }, balance },
          evt
        ) => {
          if (!balance || !amountInMinor) {
            return undefined;
          }

          const reqTokenAmount = parseAmountInMinorForComparison(
            amountInMinor.toString(),
            balance.tokenInfo.decimals
          );
          if (!reqTokenAmount) return false;

          return balance.allowance.lt(reqTokenAmount);
        },
      },
      services: {
        fetchBalances: (context, event) =>
          new Promise((resolve, reject) => {
            const tokens = context.invoice.coins.filter(
              (c) => c.chainId === context.chain.chainId
            );
            getBalances(tokens, context.signer)
              .then((balances) => {
                resolve({
                  balances: balances,
                });
              })
              .catch((e) => reject(e));
          }),
        selectChain: (_context, event) =>
          Promise.resolve({ chain: getChainById(event.chainId) }),
        selectToken: (context, event) =>
          new Promise((resolve, reject) => {
            const token = event.token;
            const balance = (context.balances || []).find(
              (b) => b.tokenInfo.address === token.address
            );

            if (balance) {
              resolve(balance);
            } else {
              // This should only happen if user somehow managed to
              // navigate to the tokens page.
              // TODO: find a better way to notify in bg
              // alert("token not part of the chain");
              reject(new Error("token invalid"));
            }
          }),
        getAllowance: getAllowance,
        increaseAllowance: increaseAllowance,
        pay: pay,
      },
      actions: {
        assignBalances: assign({
          balances: (_context, event) => {
            return event.data.balances;
          },
        }),
        assignChain: assign({
          chain: (_context, event) => {
            return event.data.chain;
          },
          balances: (_context, event) => [],
          router: (context, event) =>
            getRouterContract(event.data.chain.router, context.signer),
        }),
        assignToken: assign({
          balance: (context, event) => {
            return event.data;
          },
        }),
        assignAccountsAndProvider: assign({
          walletAddress: (context, event) => event.address,
          signer: (context, event) => {
            return event.signer;
          },
        }),
        resetAfterDisconnect: assign({
          walletAddress: (_c, _e) => null,
          chain: (_c, _e) => null,
          signer: (_c, _e) => null,
          balances: (_c, _e) => [],
          balance: (_c, _e) => null,
        }),
      },
    }
  );
};
