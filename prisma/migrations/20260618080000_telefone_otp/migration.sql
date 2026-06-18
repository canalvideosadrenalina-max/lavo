-- Backfill telefone nulo antes de tornar NOT NULL
UPDATE "users" SET "telefone" = '' WHERE "telefone" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "telefone" SET DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "telefone" SET NOT NULL;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telefone_confirmado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otp_codes_telefone_usado_idx" ON "otp_codes"("telefone", "usado");
