import type { OauthCredential } from "@prisma/client";

import { prisma } from "~/db.server";

export type { OauthCredential } from "@prisma/client";

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
