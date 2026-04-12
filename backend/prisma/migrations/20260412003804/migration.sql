/*
  Warnings:

  - A unique constraint covering the columns `[userId,bookId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rating` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rating" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_bookId_key" ON "Review"("userId", "bookId");
