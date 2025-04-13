-- AlterTable
ALTER TABLE "sets" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Terms" ADD CONSTRAINT "Terms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetContent" ADD CONSTRAINT "SetContent_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "sets"("set_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetContent" ADD CONSTRAINT "SetContent_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "Terms"("term_id") ON DELETE RESTRICT ON UPDATE CASCADE;
