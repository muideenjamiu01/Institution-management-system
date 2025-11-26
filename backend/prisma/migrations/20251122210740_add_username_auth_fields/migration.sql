/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `applicants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `applicants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add nullable columns first
ALTER TABLE `applicants` 
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `refreshToken` TEXT NULL,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL,
    MODIFY `dateOfBirth` DATETIME(3) NULL,
    MODIFY `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    MODIFY `address` TEXT NULL,
    MODIFY `previousSchool` VARCHAR(191) NULL,
    MODIFY `gradeAverage` DOUBLE NULL;

-- AlterTable: Add nullable username first for students
ALTER TABLE `students` ADD COLUMN `username` VARCHAR(191) NULL;

-- Generate usernames for existing applicants (APP + id)
UPDATE `applicants` SET `username` = CONCAT('APP', LPAD(id, 6, '0')) WHERE `username` IS NULL;

-- Generate usernames for existing students (matricNo or STU + id)
UPDATE `students` SET `username` = `matricNo` WHERE `username` IS NULL;

-- Make username required now that all records have values
ALTER TABLE `applicants` MODIFY `username` VARCHAR(191) NOT NULL;
ALTER TABLE `students` MODIFY `username` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `applicants_username_key` ON `applicants`(`username`);

-- CreateIndex
CREATE INDEX `applicants_username_idx` ON `applicants`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `students_username_key` ON `students`(`username`);

-- CreateIndex
CREATE INDEX `students_username_idx` ON `students`(`username`);
