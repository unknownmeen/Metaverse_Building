-- AlterTable: Change Notification.missionId foreign key from ON DELETE SET NULL to ON DELETE CASCADE
-- When a mission (or product containing missions) is deleted, related notifications are now deleted.
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_missionId_fkey";
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
