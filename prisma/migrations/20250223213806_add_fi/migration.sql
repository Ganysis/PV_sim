/*
  Warnings:

  - You are about to drop the column `administrativeArea` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `federalIncentive` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `panelCapacityWatts` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `panelHeightMeters` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `panelWidthMeters` on the `SolarEstimate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" DROP COLUMN "administrativeArea",
DROP COLUMN "federalIncentive",
DROP COLUMN "panelCapacityWatts",
DROP COLUMN "panelHeightMeters",
DROP COLUMN "panelWidthMeters",
ADD COLUMN     "loanDurationYears" INTEGER,
ADD COLUMN     "loanMonthlyPayment" DOUBLE PRECISION;
