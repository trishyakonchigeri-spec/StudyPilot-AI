/*
  Warnings:

  - You are about to drop the column `date` on the `studysession` table. All the data in the column will be lost.
  - Added the required column `startTime` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyDate` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `studysession` DROP COLUMN `date`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `startTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `studyDate` DATETIME(3) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
