/*
  Warnings:

  - You are about to drop the column `created_at` on the `sets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SetContent" DROP CONSTRAINT "SetContent_term_id_fkey";

-- AlterTable
ALTER TABLE "sets" DROP COLUMN "created_at";

-- AddForeignKey
ALTER TABLE "SetContent" ADD CONSTRAINT "SetContent_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Terms"("term_id") ON DELETE CASCADE ON UPDATE CASCADE;
