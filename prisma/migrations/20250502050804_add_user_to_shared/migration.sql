/*
  Warnings:

  - Added the required column `user_id` to the `Shared` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shared" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Shared" ADD CONSTRAINT "Shared_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
