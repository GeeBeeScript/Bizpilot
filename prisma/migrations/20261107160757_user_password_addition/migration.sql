/*
  Warnings:

  - You are about to drop the column `accountManager` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_managerId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "accountManager",
ADD COLUMN     "accountManagerId" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "clientName",
ALTER COLUMN "managerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "device" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
