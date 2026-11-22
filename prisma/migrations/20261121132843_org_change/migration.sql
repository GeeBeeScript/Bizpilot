/*
  Warnings:

  - You are about to drop the column `invitedClient` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `invitedMembers` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `linkedOrgId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_linkedOrgId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- DropIndex
DROP INDEX "User_linkedOrgId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "invitedClient",
DROP COLUMN "invitedMembers";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "linkedOrgId",
DROP COLUMN "orgId";
