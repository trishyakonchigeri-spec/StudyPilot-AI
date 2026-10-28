-- AlterTable
ALTER TABLE `quizresult` ADD COLUMN `documentId` INTEGER NULL,
    ADD COLUMN `documentName` VARCHAR(191) NULL,
    ADD COLUMN `questions` JSON NULL,
    ADD COLUMN `selectedAnswers` JSON NULL;

-- CreateIndex
CREATE INDEX `QuizResult_documentId_idx` ON `QuizResult`(`documentId`);

-- AddForeignKey
ALTER TABLE `QuizResult` ADD CONSTRAINT `QuizResult_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
