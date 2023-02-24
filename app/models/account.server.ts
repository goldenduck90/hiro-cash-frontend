import type { Account, OauthCredential } from "@prisma/client";
import { prisma } from "~/db.server";

export async function findAllAccount() {
  try {
    return await prisma.account.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {},
      include: {
        wallets: {
          // orderBy: {
          //   createdAt: "asc",
          // },
        },
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}


export async function findAllAccountPagination(skip: number, take: number) {
  try {
    return await prisma.account.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: take,
      where: {},
      include: {
        wallets: {

        },
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function findAccount(username: string) {
  try {
    return await prisma.account.findUniqueOrThrow({
      where: {
        username: username,
      },
      include: {
        wallets: {
          // orderBy: {
          //   createdAt: "desc",
          // },
        },
      },
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function createAccount(
  oauthCredential: OauthCredential,
  username: string
) {
  return await prisma.account.create({
    data: {
      username: username,
      oauthCredentials: {
        connect: { id: oauthCredential.id },
      },
    },
  });
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

export async function updateAccount(account: Account, username: string) {
  return await prisma.account.update({
    where: {
      id: account.id,
    },
    data: {
      username,
    },
  });
}
