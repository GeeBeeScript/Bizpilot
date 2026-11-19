-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "invitedClients" JSONB[],
ALTER COLUMN "website" DROP NOT NULL;
