-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPasswordResetSentAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordResetCodeHash" TEXT,
ADD COLUMN     "passwordResetExpiry" TIMESTAMP(3);

