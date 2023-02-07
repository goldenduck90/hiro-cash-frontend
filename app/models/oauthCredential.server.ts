import { prisma } from "~/db.server";
import type { SessionCredential } from "~/services/auth.server";

export type { OauthCredential } from "@prisma/client";

export async function findFromSession({ id }: SessionCredential) {
  return await prisma.oauthCredential.findUniqueOrThrow({
    where: {
      id: id,
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
) {
  return await prisma.oauthCredential.upsert({
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
