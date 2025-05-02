-- CreateTable
CREATE TABLE "Shared" (
    "shared_id" TEXT NOT NULL,
    "shared_name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "inserted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shared_pkey" PRIMARY KEY ("shared_id")
);
