/*
  Warnings:

  - The primary key for the `SetContent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sets` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "SetContent" DROP CONSTRAINT "SetContent_set_id_fkey";

-- AlterTable
ALTER TABLE "SetContent" DROP CONSTRAINT "SetContent_pkey",
ALTER COLUMN "set_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SetContent_pkey" PRIMARY KEY ("set_id", "term_id");

-- AlterTable
ALTER TABLE "sets" DROP CONSTRAINT "sets_pkey",
ALTER COLUMN "set_id" DROP DEFAULT,
ALTER COLUMN "set_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "sets_pkey" PRIMARY KEY ("set_id");
DROP SEQUENCE "sets_set_id_seq";

-- AddForeignKey
ALTER TABLE "SetContent" ADD CONSTRAINT "SetContent_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "sets"("set_id") ON DELETE RESTRICT ON UPDATE CASCADE;
