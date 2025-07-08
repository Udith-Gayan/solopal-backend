/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `hostId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "createdByUserId",
ADD COLUMN     "hostId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
