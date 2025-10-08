/*
  Warnings:

  - You are about to drop the column `documentUrl` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `issuedBy` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `issuedDate` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `documentId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `encrypted` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `isLatest` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnails` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `virusScanned` on the `files` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileId]` on the table `certifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[s3Key]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issueDate` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuingBody` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Made the column `fileId` on table `certifications` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `s3Key` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."files_category_entityType_entityId_idx";

-- AlterTable
ALTER TABLE "certifications" DROP COLUMN "documentUrl",
DROP COLUMN "issuedBy",
DROP COLUMN "issuedDate",
ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "isValidated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "issuingBody" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validatedAt" TIMESTAMP(3),
ADD COLUMN     "validatedBy" TEXT,
ALTER COLUMN "fileId" SET NOT NULL;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "category",
DROP COLUMN "documentId",
DROP COLUMN "encrypted",
DROP COLUMN "entityId",
DROP COLUMN "entityType",
DROP COLUMN "filename",
DROP COLUMN "isLatest",
DROP COLUMN "metadata",
DROP COLUMN "thumbnails",
DROP COLUMN "version",
DROP COLUMN "virusScanned",
ADD COLUMN     "optimizedUrl" TEXT,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "certifications_fileId_key" ON "certifications"("fileId");

-- CreateIndex
CREATE INDEX "certifications_farmerId_idx" ON "certifications"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "files_s3Key_key" ON "files"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "files_url_key" ON "files"("url");

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
