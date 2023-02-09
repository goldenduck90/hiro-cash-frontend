import type { Account, Wallet } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Wallet } from "@prisma/client";

export async function deleteWallet(wallet: Wallet) {
  try {
    return await prisma.wallet.delete({
      where: {
        id: wallet.id,
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function updateWallet(
  wallet: Wallet,
  address: string,
  props: {
    type: string | undefined;
    exchange: string | undefined;
    config: { coins: string[] };
  }
) {
  try {
    return await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        address: address,
        type: props.type,
        exchange: props.exchange,
        config: props.config,
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function createWallet(
  account: Account,
  address: string,
  props: {
    type: string | undefined;
    exchange: string | undefined;
    config: { coins: string[] };
  }
) {
  try {
    return await prisma.wallet.create({
      data: {
        address: address,
        type: props.type,
        exchange: props.exchange,
        config: props.config,
        account: {
          connect: { id: account.id },
        },
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}
