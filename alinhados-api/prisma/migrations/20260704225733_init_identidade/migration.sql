-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('barbeiro', 'barbearia');

-- CreateEnum
CREATE TYPE "profile_status" AS ENUM ('disponivel', 'aberto', 'indisponivel', 'pausado');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_type" "UserType" NOT NULL,
    "nome" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "pais" TEXT DEFAULT 'Brasil',
    "bio" TEXT,
    "avatar_url" TEXT,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "status" "profile_status" NOT NULL DEFAULT 'indisponivel',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barbeiro_details" (
    "profile_id" UUID NOT NULL,
    "apelido_profissional" TEXT,
    "anos_experiencia" INTEGER,
    "servicos" TEXT[],
    "cursos_formacao" TEXT,
    "comissao_desejada" INTEGER,
    "faturamento_mensal" DECIMAL(10,2),
    "taxa_ocupacao" INTEGER,
    "recorde_meta" TEXT,
    "valores" TEXT[],
    "barbearia_atual" TEXT,
    "esta_desempregado" BOOLEAN NOT NULL DEFAULT false,
    "cpf_hash" TEXT,

    CONSTRAINT "barbeiro_details_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "barbearia_details" (
    "profile_id" UUID NOT NULL,
    "nome_decisor" TEXT,
    "cnpj_hash" TEXT,
    "num_cadeiras" INTEGER,
    "vagas_abertas" INTEGER DEFAULT 0,
    "comissao_paga" INTEGER,
    "tem_fixo" BOOLEAN NOT NULL DEFAULT false,
    "valor_fixo" DECIMAL(10,2),
    "tem_clube" BOOLEAN NOT NULL DEFAULT false,
    "descricao_clube" TEXT,
    "tem_pops" BOOLEAN NOT NULL DEFAULT false,
    "num_unidades" INTEGER DEFAULT 1,
    "e_franquia" BOOLEAN NOT NULL DEFAULT false,
    "faturamento_medio" DECIMAL(10,2),
    "valores" TEXT[],
    "esta_contratando" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "barbearia_details_pkey" PRIMARY KEY ("profile_id")
);

-- AddForeignKey
ALTER TABLE "barbeiro_details" ADD CONSTRAINT "barbeiro_details_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barbearia_details" ADD CONSTRAINT "barbearia_details_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
