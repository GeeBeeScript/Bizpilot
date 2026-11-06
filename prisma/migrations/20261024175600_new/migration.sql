/*
  Warnings:

  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initials` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ToneOptions" AS ENUM ('blue', 'gold', 'emerald', 'sapphire', 'amber', 'crimson');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('active', 'onboarding', 'paused', 'inactive');

-- CreateEnum
CREATE TYPE "Health" AS ENUM ('on_track', 'at_risk', 'off_track');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('planning', 'active', 'on_hold', 'completed');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'blocked', 'done');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('uploading', 'processing', 'indexing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "DocumentItemKind" AS ENUM ('pdf', 'docx', 'xlsx', 'image', 'other');

-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('upload', 'approval', 'comment', 'complete', 'assign', 'create', 'update', 'ai', 'alert');

-- CreateEnum
CREATE TYPE "MileStoneStatus" AS ENUM ('done', 'upcoming', 'late', 'awaiting_approval');

-- CreateEnum
CREATE TYPE "AttentionType" AS ENUM ('overdue_project', 'blocked_task', 'approval', 'follow_up', 'automation', 'document');

-- CreateEnum
CREATE TYPE "AttentionUrgency" AS ENUM ('critical', 'high', 'medium');

-- CreateEnum
CREATE TYPE "DeadlineKind" AS ENUM ('milestone', 'task');

-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('on_track', 'at_risk', 'late');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('mentions', 'tasks', 'projects', 'clients', 'ai', 'billing');

-- CreateEnum
CREATE TYPE "kpiCategoryId" AS ENUM ('clients', 'projects', 'overdue', 'revenue', 'ai');

-- CreateEnum
CREATE TYPE "kpiTrend" AS ENUM ('up', 'down', 'flat');

-- CreateEnum
CREATE TYPE "kpiSentiment" AS ENUM ('positive', 'negative', 'neutral');

-- CreateEnum
CREATE TYPE "SingletonId" AS ENUM ('SINGLETON');

-- CreateEnum
CREATE TYPE "AIScopeKind" AS ENUM ('workspace', 'client', 'project', 'document');

-- CreateEnum
CREATE TYPE "AICitationKind" AS ENUM ('document', 'client', 'project', 'task', 'activity');

-- CreateEnum
CREATE TYPE "AIProposedActionKind" AS ENUM ('create_task', 'send_email', 'update_status', 'update_client');

-- CreateEnum
CREATE TYPE "AIProposedActionState" AS ENUM ('pending', 'approved', 'dismissed');

-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "AIMessageStatus" AS ENUM ('thinking', 'streaming', 'done', 'error', 'stoppped');

-- CreateEnum
CREATE TYPE "AutomationNodeKind" AS ENUM ('trigger', 'condition', 'action', 'ai');

-- CreateEnum
CREATE TYPE "AutomationRunStatus" AS ENUM ('success', 'failed', 'running', 'retrying');

-- CreateEnum
CREATE TYPE "AutomationRunStepsState" AS ENUM ('done', 'active', 'pending', 'failed');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('client', 'project', 'task', 'document', 'billing');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('owner', 'admin', 'manager', 'employee');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('active', 'invited', 'deactivated');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('paid', 'open', 'failed');

-- CreateEnum
CREATE TYPE "PlanCategoryId" AS ENUM ('starter', 'growth', 'scale');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('connected', 'error', 'available');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "clientOrgId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "initials" TEXT NOT NULL,
ADD COLUMN     "online" TEXT,
ADD COLUMN     "orgId" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "tone" "ToneOptions" NOT NULL DEFAULT 'blue',
    "industry" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL,
    "health" "Health" NOT NULL,
    "primaryContactId" TEXT NOT NULL,
    "accountManager" TEXT NOT NULL,
    "activeProjects" INTEGER NOT NULL,
    "completedProjects" INTEGER NOT NULL,
    "openTasks" INTEGER NOT NULL,
    "pendingApprovals" INTEGER NOT NULL,
    "lastActivity" TEXT NOT NULL,
    "tags" TEXT[],
    "contractValue" INTEGER NOT NULL,
    "renewalDate" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isCollaborator" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" "MileStoneStatus" NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "health" "Health" NOT NULL,
    "openTasks" INTEGER NOT NULL,
    "blocker" TEXT,
    "budget" INTEGER NOT NULL,
    "spent" INTEGER NOT NULL,
    "collaborators" TEXT[],
    "milestones" TEXT[],
    "clientCollaboration" BOOLEAN NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "comments" INTEGER NOT NULL,
    "attachments" INTEGER NOT NULL,
    "dependencies" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "DocumentItemKind" NOT NULL,
    "size" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "indexed" BOOLEAN NOT NULL,
    "clientVisible" BOOLEAN NOT NULL,

    CONSTRAINT "DocumentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiviyItem" (
    "id" TEXT NOT NULL,
    "actor" TEXT,
    "verb" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "href" TEXT,
    "timestamp" TEXT NOT NULL,
    "context" TEXT,
    "kind" "ActivityKind" NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "ActiviyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttentionItem" (
    "id" TEXT NOT NULL,
    "type" "AttentionType" NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "urgency" "AttentionUrgency" NOT NULL,
    "deadline" TEXT NOT NULL,
    "deadlineLabel" TEXT NOT NULL,
    "action" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttentionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "kind" "DeadlineKind" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "DeadlineStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deadline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationSummary" (
    "id" "SingletonId" NOT NULL DEFAULT 'SINGLETON',
    "active" INTEGER NOT NULL,
    "failedRuns" INTEGER NOT NULL,
    "awaitingRetry" INTEGER NOT NULL,
    "lastSuccess" TEXT NOT NULL,
    "recent" JSONB NOT NULL,

    CONSTRAINT "AutomationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationItem" (
    "id" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" TEXT NOT NULL,
    "categoryId" "kpiCategoryId" NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "trend" "kpiTrend" NOT NULL,
    "sentiment" "kpiSentiment" NOT NULL,
    "href" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "plan" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIScope" (
    "id" TEXT NOT NULL,
    "kind" "AIScopeKind" NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AIScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICitation" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "AICitationKind" NOT NULL,
    "href" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProposedAction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" "AIProposedActionKind" NOT NULL,
    "fields" JSONB[],
    "state" "AIProposedActionState" NOT NULL,

    CONSTRAINT "AIProposedAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scopeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPage" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "paragraphs" TEXT[],

    CONSTRAINT "DocumentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationNode" (
    "id" TEXT NOT NULL,
    "kind" "AutomationNodeKind" NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "automationId" TEXT NOT NULL,

    CONSTRAINT "AutomationNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationEdge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "label" TEXT,
    "automationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status" "AutomationRunStatus" NOT NULL,
    "trigger" TEXT NOT NULL,
    "startedAt" TEXT NOT NULL,
    "label" JSONB[],

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "triggerLabel" TEXT NOT NULL,
    "triggerType" "AutomationTriggerType" NOT NULL,
    "actionsSummary" TEXT[],
    "creatorId" TEXT NOT NULL,
    "lastRun" TEXT NOT NULL,
    "successCount" INTEGER NOT NULL,
    "failureCount" INTEGER NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "member" "Roles" NOT NULL,
    "status" "TeamMemberStatus" NOT NULL,
    "activeProjects" INTEGER NOT NULL,
    "openTasks" INTEGER NOT NULL,
    "overdueTasks" INTEGER NOT NULL,
    "workload" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "lastActive" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageMeterData" (
    "id" TEXT NOT NULL,
    "categoryId" "PlanCategoryId" NOT NULL,
    "name" TEXT NOT NULL,
    "monthly" INTEGER NOT NULL,
    "annual" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageMeterData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "connectedAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lastActive" TEXT NOT NULL,
    "current" BOOLEAN,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deadline_projectId_key" ON "Deadline"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_key" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clientOrgId_fkey" FOREIGN KEY ("clientOrgId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttentionItem" ADD CONSTRAINT "AttentionItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deadline" ADD CONSTRAINT "Deadline_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "AIScope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationNode" ADD CONSTRAINT "AutomationNode_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationEdge" ADD CONSTRAINT "AutomationEdge_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
