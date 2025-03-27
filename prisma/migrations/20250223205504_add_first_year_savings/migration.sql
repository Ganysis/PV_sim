/*
  Warnings:

  - Added the required column `firstYearSavings` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" ADD COLUMN     "firstYearSavings" DOUBLE PRECISION NOT NULL;
