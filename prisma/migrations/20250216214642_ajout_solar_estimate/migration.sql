/*
  Warnings:

  - You are about to drop the column `consumptionType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `electricity` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equipment` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `solarPotential` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "consumptionType",
DROP COLUMN "electricity",
DROP COLUMN "equipment",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "solarPotential",
DROP COLUMN "status",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "SolarEstimate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "postalCode" TEXT,
    "administrativeArea" TEXT,
    "maxArrayPanelsCount" INTEGER NOT NULL,
    "maxArrayAreaMeters2" DOUBLE PRECISION NOT NULL,
    "maxSunshineHoursPerYear" INTEGER NOT NULL,
    "solarPercentage" DOUBLE PRECISION NOT NULL,
    "costOfElectricityWithoutSolar" DOUBLE PRECISION NOT NULL,
    "remainingLifetimeUtilityBill" DOUBLE PRECISION NOT NULL,
    "federalIncentive" DOUBLE PRECISION,
    "savingsLifetime" DOUBLE PRECISION NOT NULL,
    "paybackYears" DOUBLE PRECISION NOT NULL,
    "yearlyEnergyDcKwh" DOUBLE PRECISION NOT NULL,
    "percentageExportedToGrid" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolarEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "SolarEstimate" ADD CONSTRAINT "SolarEstimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
