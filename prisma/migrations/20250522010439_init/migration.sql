-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('VALID', 'INVALID');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "reason" TEXT,
    "suspicious" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
