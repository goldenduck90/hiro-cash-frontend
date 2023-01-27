-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "config" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'wallet';
