/*
  Warnings:

  - You are about to drop the column `showId` on the `Recommendation` table. All the data in the column will be lost.
  - Added the required column `podcastId` to the `Recommendation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_showId_fkey";

-- DropIndex
DROP INDEX "Recommendation_showId_idx";

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "showId",
ADD COLUMN     "podcastId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Recommendation_podcastId_idx" ON "Recommendation"("podcastId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
