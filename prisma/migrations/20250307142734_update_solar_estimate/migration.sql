/*
  Warnings:

  - You are about to drop the column `firstyearSavingsWithSell` on the `SolarEstimate` table. All the data in the column will be lost.
  - Added the required column `firstYearSavingsWithSell` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" DROP COLUMN "firstyearSavingsWithSell",
ADD COLUMN     "firstYearSavingsWithSell" DOUBLE PRECISION NOT NULL;
