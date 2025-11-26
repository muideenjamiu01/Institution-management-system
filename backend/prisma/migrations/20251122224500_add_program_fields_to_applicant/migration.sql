-- CreateEnum for ProgramType
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3) NULL,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `_prisma_migrations_migration_name_key`(`migration_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `applicants` ADD COLUMN `programType` ENUM('ND', 'HND', 'BSC', 'MSC', 'PHD', 'CERTIFICATE', 'DIPLOMA') NULL AFTER `gradeAverage`,
    ADD COLUMN `departmentId` INTEGER NULL AFTER `programType`,
    ADD COLUMN `programId` INTEGER NULL AFTER `departmentId`;

-- CreateIndex
CREATE INDEX `applicants_departmentId_idx` ON `applicants`(`departmentId`);

-- CreateIndex
CREATE INDEX `applicants_programId_idx` ON `applicants`(`programId`);

-- AddForeignKey
ALTER TABLE `applicants` ADD CONSTRAINT `applicants_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applicants` ADD CONSTRAINT `applicants_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
