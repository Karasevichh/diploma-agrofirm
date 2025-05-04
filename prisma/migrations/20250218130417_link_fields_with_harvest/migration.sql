/*
  Warnings:

  - You are about to drop the column `area` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `crop` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `plantedAt` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `yield` on the `Field` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[harvestId]` on the table `Field` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `harvestId` to the `Field` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Field" DROP COLUMN "area",
DROP COLUMN "crop",
DROP COLUMN "plantedAt",
DROP COLUMN "yield",
ADD COLUMN     "harvestId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Field_harvestId_key" ON "Field"("harvestId");

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
