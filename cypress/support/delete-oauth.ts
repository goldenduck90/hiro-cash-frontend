// Use this to delete a oauth by their email
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-oauth.ts "${provider}" "${userId}"
// and that oauth will get deleted

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { installGlobals } from "@remix-run/node";

import { prisma } from "~/db.server";

installGlobals();

async function deleteUser(provider: string, userId: string) {
  if (!userId) {
    throw new Error("userId required to delete oAuth");
  }
  if (!provider) {
    throw new Error("provider required to delete oAuth");
  }
  const provider_userId = { provider, userId };
  try {
    await prisma.oauthCredential.delete({ where: { provider_userId } });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.log("OAuth not found, so no need to delete");
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser(process.argv[2], process.argv[3]);
