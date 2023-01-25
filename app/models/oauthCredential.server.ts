import type { Account, OauthCredential } from "@prisma/client";

import { prisma } from "~/db.server";

export type { OauthCredential } from "@prisma/client";

export async function createAccount(
  oauthCredential: OauthCredential,
  username: string
) {
  try {
    return await prisma.account.create({
      data: {
        username: username,
        oauthCredentials: {
          connect: { id: oauthCredential.id },
        },
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function deleteAccount(account: Account) {
  try {
    return await prisma.account.delete({
      where: {
        id: account.id,
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
export async function findOauthCredential(provider: string, userId: string) {
  return await prisma.oauthCredential.findUniqueOrThrow({
    where: {
      provider_userId: { provider, userId },
    },
    include: {
      accounts: {
        include: {
          wallets: true,
        },
      },
    },
  });
}

export async function findOrCreatOauthCredential(
  provider: string,
  userId: string,
  profile: object
): OauthCredential {
  // return await prisma.oauthCredential.create({
  //   data: {
  //     provider,
  //     userId,
  //     profile,
  //   },
  // });
  return prisma.oauthCredential.upsert({
    where: {
      provider_userId: {
        provider,
        userId,
      },
    },
    update: {},
    create: {
      provider,
      userId,
      profile,
    },
  });
}
