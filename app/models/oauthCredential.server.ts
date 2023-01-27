import type { OauthCredential } from "@prisma/client";

import { prisma } from "~/db.server";

export type { OauthCredential } from "@prisma/client";

export async function findOauthCredential(provider: string, userId: string) {
  return await prisma.oauthCredential.findUniqueOrThrow({
    where: {
      provider_userId: { provider, userId },
    },
    include: {
      accounts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          wallets: {
            // orderBy: {
            //   createdAt: "desc",
            // },
          },
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
