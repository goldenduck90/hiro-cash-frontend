// Use this to delete a user by their email
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts username@example.com
// and that user will get deleted

import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { installGlobals } from "@remix-run/node";

import { prisma } from "~/db.server";

installGlobals();

async function deleteUser(provider: string, userId: string) {
  if (!userId) {
    throw new Error("userId required for login");
  }
  if (!provider) {
    throw new Error("provider required for login");
  }
  const provider_userId = { provider, userId };
  try {
    await prisma.oauthCredential.delete({ where: { provider_userId } });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.log("User not found, so no need to delete");
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser(process.argv[2], process.argv[3]);
