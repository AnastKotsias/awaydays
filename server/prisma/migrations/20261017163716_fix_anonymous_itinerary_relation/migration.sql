/*
  Warnings:

  - Made the column `userId` on table `SpotReview` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Itinerary" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SpotReview" ALTER COLUMN "userId" SET NOT NULL;
