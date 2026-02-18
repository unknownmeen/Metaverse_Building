-- AlterTable: Make Mission.assigneeId optional (nullable)
-- This allows creating missions without an assignee (status: PENDING until someone takes it)
-- When assignee is set at creation, mission starts as IN_PROGRESS (auto-claimed)

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE "Mission" DROP CONSTRAINT IF EXISTS "Mission_assigneeId_fkey";

-- Step 2: Alter column to allow NULL
ALTER TABLE "Mission" ALTER COLUMN "assigneeId" DROP NOT NULL;

-- Step 3: Re-add foreign key with ON DELETE SET NULL (when user is deleted, mission stays with null assignee)
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_assigneeId_fkey" 
  FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
