/*
  Warnings:

  - Added the required column `firstyearSavingsWithSell` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" ADD COLUMN     "firstyearSavingsWithSell" DOUBLE PRECISION NOT NULL;
