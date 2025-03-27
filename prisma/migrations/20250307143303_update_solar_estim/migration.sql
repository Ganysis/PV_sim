/*
  Warnings:

  - Made the column `savingsLifetimeWithSell` on table `SolarEstimate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `savingsLifetimeWithoutSell` on table `SolarEstimate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" ALTER COLUMN "savingsLifetimeWithSell" SET NOT NULL,
ALTER COLUMN "savingsLifetimeWithoutSell" SET NOT NULL;
