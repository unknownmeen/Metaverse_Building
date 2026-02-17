-- DropIndex
DROP INDEX "ChatMessage_missionId_stepId_createdAt_idx";

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "creatorId" INTEGER;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "stepId" TEXT;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
