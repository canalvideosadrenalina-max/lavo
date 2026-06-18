-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'LAVAJATO');

-- CreateEnum
CREATE TYPE "LavaJatoStatus" AS ENUM ('PENDENTE', 'ATIVO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "AgendamentoStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lava_jatos" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "status" "LavaJatoStatus" NOT NULL DEFAULT 'PENDENTE',
    "hora_abertura" TEXT NOT NULL,
    "hora_fechamento" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lava_jatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "lavajato_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_centavos" INTEGER NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "lavajato_id" TEXT NOT NULL,
    "servico_id" TEXT NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status" "AgendamentoStatus" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lava_jatos_owner_id_key" ON "lava_jatos"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "lava_jatos_slug_key" ON "lava_jatos"("slug");

-- CreateIndex
CREATE INDEX "lava_jatos_cidade_idx" ON "lava_jatos"("cidade");

-- CreateIndex
CREATE INDEX "servicos_lavajato_id_idx" ON "servicos"("lavajato_id");

-- CreateIndex
CREATE INDEX "agendamentos_lavajato_id_data_hora_idx" ON "agendamentos"("lavajato_id", "data_hora");

-- CreateIndex
CREATE INDEX "agendamentos_cliente_id_idx" ON "agendamentos"("cliente_id");

-- AddForeignKey
ALTER TABLE "lava_jatos" ADD CONSTRAINT "lava_jatos_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_lavajato_id_fkey" FOREIGN KEY ("lavajato_id") REFERENCES "lava_jatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_lavajato_id_fkey" FOREIGN KEY ("lavajato_id") REFERENCES "lava_jatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
