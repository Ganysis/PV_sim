/*
  Warnings:

  - You are about to drop the column `bestRoofSegmentArea` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `bestRoofSegmentLat` on the `SolarEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `bestRoofSegmentLng` on the `SolarEstimate` table. All the data in the column will be lost.
  - Added the required column `panelsCount` to the `SolarEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SolarEstimate" DROP COLUMN "bestRoofSegmentArea",
DROP COLUMN "bestRoofSegmentLat",
DROP COLUMN "bestRoofSegmentLng",
ADD COLUMN     "panelsCount" INTEGER NOT NULL,
ADD COLUMN     "roofOrientation" TEXT,
ADD COLUMN     "roofTilt" DOUBLE PRECISION;
