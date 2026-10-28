-- CreateTable
CREATE TABLE `DocumentChunk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `documentId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `chunkIndex` INTEGER NOT NULL,
    `embedding` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DocumentChunk_documentId_chunkIndex_key`(`documentId`, `chunkIndex`),
    INDEX `DocumentChunk_documentId_idx`(`documentId`),
    INDEX `DocumentChunk_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DocumentChunk`
    ADD CONSTRAINT `DocumentChunk_documentId_fkey`
    FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentChunk`
    ADD CONSTRAINT `DocumentChunk_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;