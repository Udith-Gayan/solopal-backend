/*
  Warnings:

  - The values [Lunch,Trip,Coffee,Party,Walk,Other] on the enum `ActivityCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [Public,FriendsOnly,Private] on the enum `ActivityVisibility` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Accepted,Blocked] on the enum `FriendshipStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Joined,Pending,Cancelled] on the enum `ParticipantStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `chatRoomId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `senderUserId` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ChatRoom` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senderId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'FACEBOOK', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DIRECT', 'GROUP', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_BEHAVIOR', 'SPAM', 'FAKE_PROFILE', 'HARASSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityCategory_new" AS ENUM ('LUNCH', 'TRIP', 'COFFEE', 'PARTY', 'WALK', 'TRAVEL', 'DINING', 'SPORTS', 'OUTDOOR', 'FITNESS', 'EVENT', 'OTHER');
ALTER TABLE "Activity" ALTER COLUMN "category" TYPE "ActivityCategory_new" USING ("category"::text::"ActivityCategory_new");
ALTER TYPE "ActivityCategory" RENAME TO "ActivityCategory_old";
ALTER TYPE "ActivityCategory_new" RENAME TO "ActivityCategory";
DROP TYPE "ActivityCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityVisibility_new" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE');
ALTER TABLE "Activity" ALTER COLUMN "visibility" TYPE "ActivityVisibility_new" USING ("visibility"::text::"ActivityVisibility_new");
ALTER TYPE "ActivityVisibility" RENAME TO "ActivityVisibility_old";
ALTER TYPE "ActivityVisibility_new" RENAME TO "ActivityVisibility";
DROP TYPE "ActivityVisibility_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FriendshipStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');
ALTER TABLE "UserFriendship" ALTER COLUMN "status" TYPE "FriendshipStatus_new" USING ("status"::text::"FriendshipStatus_new");
ALTER TYPE "FriendshipStatus" RENAME TO "FriendshipStatus_old";
ALTER TYPE "FriendshipStatus_new" RENAME TO "FriendshipStatus";
DROP TYPE "FriendshipStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ParticipantStatus_new" AS ENUM ('JOINED', 'PENDING', 'CANCELLED');
ALTER TABLE "ActivityParticipant" ALTER COLUMN "status" TYPE "ParticipantStatus_new" USING ("status"::text::"ParticipantStatus_new");
ALTER TYPE "ParticipantStatus" RENAME TO "ParticipantStatus_old";
ALTER TYPE "ParticipantStatus_new" RENAME TO "ParticipantStatus";
DROP TYPE "ParticipantStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderUserId_fkey";

-- DropForeignKey
ALTER TABLE "ChatRoom" DROP CONSTRAINT "ChatRoom_activityId_fkey";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "currentParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "interests" TEXT[];

-- AlterTable
ALTER TABLE "ActivityParticipant" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "chatRoomId",
DROP COLUMN "senderUserId",
ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "groupChatId" TEXT,
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'DIRECT',
ADD COLUMN     "receiverId" TEXT,
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "ChatRoom";

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "activityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,
    "concurrencyKey" TEXT NOT NULL,

    CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupChatMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupChatId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GroupChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,
    "concurrencyKey" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupChat_activityId_key" ON "GroupChat"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupChatMember_userId_groupChatId_key" ON "GroupChatMember"("userId", "groupChatId");

-- AddForeignKey
ALTER TABLE "GroupChat" ADD CONSTRAINT "GroupChat_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_groupChatId_fkey" FOREIGN KEY ("groupChatId") REFERENCES "GroupChat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChatMember" ADD CONSTRAINT "GroupChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChatMember" ADD CONSTRAINT "GroupChatMember_groupChatId_fkey" FOREIGN KEY ("groupChatId") REFERENCES "GroupChat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
