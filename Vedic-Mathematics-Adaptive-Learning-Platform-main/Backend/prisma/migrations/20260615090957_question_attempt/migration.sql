-- AlterTable
ALTER TABLE "QuestionAttempt" ADD COLUMN     "generatedQuestionId" INTEGER;

-- AddForeignKey
ALTER TABLE "QuestionAttempt" ADD CONSTRAINT "QuestionAttempt_generatedQuestionId_fkey" FOREIGN KEY ("generatedQuestionId") REFERENCES "GeneratedQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
