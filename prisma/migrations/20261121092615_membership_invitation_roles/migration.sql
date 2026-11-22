/*
  Warnings:

  - The values [employee] on the enum `Roles` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `invitationtype` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationType` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roles` to the `Invitation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `role` on the `Membership` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `kind` on the `Membership` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Kind" AS ENUM ('internal', 'client');

-- AlterEnum
BEGIN;
CREATE TYPE "Roles_new" AS ENUM ('owner', 'admin', 'manager', 'member');
ALTER TABLE "Membership" ALTER COLUMN "role" TYPE "Roles_new" USING ("role"::text::"Roles_new");
ALTER TABLE "TeamMember" ALTER COLUMN "member" TYPE "Roles_new" USING ("member"::text::"Roles_new");
ALTER TYPE "Roles" RENAME TO "Roles_old";
ALTER TYPE "Roles_new" RENAME TO "Roles";
DROP TYPE "public"."Roles_old";
COMMIT;

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "invitationtype",
ADD COLUMN     "clientPayload" TEXT[],
ADD COLUMN     "invitationType" "InvitationType" NOT NULL,
ADD COLUMN     "kind" "Kind" NOT NULL,
ADD COLUMN     "managerId" TEXT,
ADD COLUMN     "roles" "Roles" NOT NULL;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "role",
ADD COLUMN     "role" "Roles" NOT NULL,
DROP COLUMN "kind",
ADD COLUMN     "kind" "Kind" NOT NULL;

-- DropEnum
DROP TYPE "MemberShipKind";

-- DropEnum
DROP TYPE "MembershipRoles";

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_orgId_idx" ON "Invitation"("orgId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
