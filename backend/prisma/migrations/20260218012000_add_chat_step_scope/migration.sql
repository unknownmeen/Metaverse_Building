ALTER TABLE "ChatMessage"
ADD COLUMN "stepId" TEXT;

ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_stepId_fkey"
FOREIGN KEY ("stepId") REFERENCES "JudgingStep"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "ChatMessage_missionId_stepId_createdAt_idx"
ON "ChatMessage"("missionId", "stepId", "createdAt");
