/*
  Warnings:

  - You are about to drop the column `colour` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `finesDue` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `netWeight` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fullName` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNumber` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vin` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_vehicleId_fkey`;

-- DropForeignKey
ALTER TABLE `Vehicle` DROP FOREIGN KEY `Vehicle_driverId_fkey`;

-- AlterTable
ALTER TABLE `Vehicle` DROP COLUMN `colour`,
    DROP COLUMN `driverId`,
    DROP COLUMN `finesDue`,
    DROP COLUMN `netWeight`,
    DROP COLUMN `plateNumber`,
    DROP COLUMN `weight`,
    DROP COLUMN `year`,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL,
    ADD COLUMN `licenseNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `vin` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Driver`;

-- DropTable
DROP TABLE `Payment`;
