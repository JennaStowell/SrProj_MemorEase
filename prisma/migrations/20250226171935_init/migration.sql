-- CreateTable
CREATE TABLE "Sets" (
    "set_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "set_name" TEXT NOT NULL,

    CONSTRAINT "Sets_pkey" PRIMARY KEY ("set_id")
);

-- CreateTable
CREATE TABLE "Terms" (
    "term_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "Terms_pkey" PRIMARY KEY ("term_id")
);

-- CreateTable
CREATE TABLE "SetContent" (
    "set_id" INTEGER NOT NULL,
    "term_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SetContent_pkey" PRIMARY KEY ("set_id","term_id")
);
