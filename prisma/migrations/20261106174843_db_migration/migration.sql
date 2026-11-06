/*
  Warnings:

  - You are about to drop the column `activeProjects` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `completedProjects` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `openTasks` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `DocumentVersion` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `milestones` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Org` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[linkedOrgId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orgId` to the `AICitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AIConversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AIProposedAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AIScope` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `ActiviyItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AttentionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Automation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Automation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AutomationEdge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AutomationNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AutomationNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AutomationRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AutomationRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `AutomationSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `DocumentItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `DocumentPage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Kpi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `NotificationItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessSize` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessType` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `website` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `UsageMeterData` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeammateStatus" AS ENUM ('Admin', 'Manager', 'Employee');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_orgId_fkey";

-- AlterTable
ALTER TABLE "AICitation" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AIConversation" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AIProposedAction" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AIScope" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ActiviyItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AttentionItem" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Automation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AutomationEdge" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AutomationNode" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AutomationRun" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AutomationSummary" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "activeProjects",
DROP COLUMN "completedProjects",
DROP COLUMN "openTasks",
ADD COLUMN     "linkedOrgId" TEXT;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentItem" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentPage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentVersion" DROP COLUMN "uploadedAt";

-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Kpi" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NotificationItem" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "plan",
ADD COLUMN     "businessSize" TEXT NOT NULL,
ADD COLUMN     "businessType" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "invitedMembers" JSONB[],
ADD COLUMN     "website" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "milestones",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "status" "TaskStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UsageMeterData" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedOrgId" TEXT;

-- DropTable
DROP TABLE "Org";

-- CreateIndex
CREATE UNIQUE INDEX "User_linkedOrgId_key" ON "User"("linkedOrgId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedOrgId_fkey" FOREIGN KEY ("linkedOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_linkedOrgId_fkey" FOREIGN KEY ("linkedOrgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiviyItem" ADD CONSTRAINT "ActiviyItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttentionItem" ADD CONSTRAINT "AttentionItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationSummary" ADD CONSTRAINT "AutomationSummary_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationItem" ADD CONSTRAINT "NotificationItem_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kpi" ADD CONSTRAINT "Kpi_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kpi" ADD CONSTRAINT "Kpi_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIScope" ADD CONSTRAINT "AIScope_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICitation" ADD CONSTRAINT "AICitation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProposedAction" ADD CONSTRAINT "AIProposedAction_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPage" ADD CONSTRAINT "DocumentPage_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNode" ADD CONSTRAINT "AutomationNode_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationEdge" ADD CONSTRAINT "AutomationEdge_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageMeterData" ADD CONSTRAINT "UsageMeterData_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
