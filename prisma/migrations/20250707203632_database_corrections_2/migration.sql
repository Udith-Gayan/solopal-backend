/*
  Warnings:

  - A unique constraint covering the columns `[userId,activityId]` on the table `ActivityParticipant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ActivityParticipant_userId_activityId_key" ON "ActivityParticipant"("userId", "activityId");
