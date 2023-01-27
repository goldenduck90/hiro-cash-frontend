import type { Account, Wallet } from "@prisma/client";

import { prisma } from "~/db.server";

export type { OauthCredential } from "@prisma/client";

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
  props: Object
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

export async function createWallet(account: Account, address: string) {
  try {
    return await prisma.wallet.create({
      data: {
        address: address,
        config: {},
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
