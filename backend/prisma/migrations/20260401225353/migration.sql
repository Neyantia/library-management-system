/*
  Warnings:

  - A unique constraint covering the columns `[normalizedFirstName,normalizedLastName]` on the table `Author` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedFirstName` to the `Author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedLastName` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "normalizedFirstName" TEXT NOT NULL,
ADD COLUMN     "normalizedLastName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Author_normalizedFirstName_normalizedLastName_key" ON "Author"("normalizedFirstName", "normalizedLastName");
