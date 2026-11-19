/*
  Warnings:

  - You are about to drop the `SignupOTP` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SignupOTP";

-- CreateTable
CREATE TABLE "otpObject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otpObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otpObject_email_key" ON "otpObject"("email");
