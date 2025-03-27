/*
  Warnings:

  - Added the required column `installationCost` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installationSizeKw` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearlyEnergyAcKwh` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" ADD COLUMN     "installationCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "installationSizeKw" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "panelCapacityWatts" DOUBLE PRECISION,
ADD COLUMN     "panelHeightMeters" DOUBLE PRECISION,
ADD COLUMN     "panelWidthMeters" DOUBLE PRECISION,
ADD COLUMN     "yearlyEnergyAcKwh" DOUBLE PRECISION NOT NULL;
