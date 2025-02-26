/*
  Warnings:

  - You are about to drop the `Sets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Sets";

-- CreateTable
CREATE TABLE "sets" (
    "set_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "set_name" TEXT NOT NULL,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("set_id")
);
