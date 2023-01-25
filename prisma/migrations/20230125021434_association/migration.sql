/*
  Warnings:

  - You are about to drop the column `accountId` on the `OauthCredential` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OauthCredential" DROP CONSTRAINT "OauthCredential_accountId_fkey";

-- AlterTable
ALTER TABLE "OauthCredential" DROP COLUMN "accountId",
ALTER COLUMN "profile" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_AccountToOauthCredential" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToOauthCredential_AB_unique" ON "_AccountToOauthCredential"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToOauthCredential_B_index" ON "_AccountToOauthCredential"("B");

-- AddForeignKey
ALTER TABLE "_AccountToOauthCredential" ADD CONSTRAINT "_AccountToOauthCredential_A_fkey" FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToOauthCredential" ADD CONSTRAINT "_AccountToOauthCredential_B_fkey" FOREIGN KEY ("B") REFERENCES "OauthCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
