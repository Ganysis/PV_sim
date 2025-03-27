/*
  Warnings:

  - Added the required column `firstYearSavingsWithoutSell` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" ADD COLUMN     "firstYearSavingsWithoutSell" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "savingsLifetimeWithSell" DOUBLE PRECISION,
ADD COLUMN     "savingsLifetimeWithoutSell" DOUBLE PRECISION;
