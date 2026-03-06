/*
  Warnings:

  - You are about to drop the column `interfazImage` on the `mediciones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mediciones" DROP COLUMN "interfazImage",
ADD COLUMN     "interfaz24Image" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "interfaz5Image" TEXT NOT NULL DEFAULT '';
