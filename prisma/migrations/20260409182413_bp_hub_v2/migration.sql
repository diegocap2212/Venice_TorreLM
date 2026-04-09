-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'BP_ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaga" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "perfil_tipo" TEXT NOT NULL,
    "senioridade" TEXT NOT NULL,
    "aba_atual" TEXT NOT NULL DEFAULT 'RECRUTAMENTO',
    "etapa_atual" TEXT NOT NULL DEFAULT 'REQUISICAO',
    "urgencia" TEXT NOT NULL DEFAULT 'NORMAL',
    "squad_destino" TEXT NOT NULL,
    "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_etapa_atual" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sla_dias" INTEGER NOT NULL DEFAULT 3,
    "briefing_handoff" TEXT,
    "bizneo_link" TEXT,
    "colaborador_contratado_id" TEXT,
    "responsavel_id" TEXT NOT NULL,
    "criado_por_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_hash" TEXT,
    "cpf_masked" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "status_cpf" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaCandidato" (
    "id" TEXT NOT NULL,
    "vaga_id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_PROCESSO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VagaCandidato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItemStatus" (
    "id" TEXT NOT NULL,
    "vaga_id" TEXT NOT NULL,
    "etapa" TEXT NOT NULL,
    "item_index" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "data_admissao" TIMESTAMP(3) NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "torre" TEXT,
    "squad" TEXT,
    "email" TEXT,
    "cpf_hash" TEXT,
    "cpf_masked" TEXT,
    "telefone" TEXT,
    "linkedin" TEXT,
    "vaga_origem_id" TEXT,
    "data_desligamento" TIMESTAMP(3),
    "informacoes_internas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data_prevista" TIMESTAMP(3) NOT NULL,
    "data_realizado" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoraExtra" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "mes_referencia" TEXT NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoraExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CicloPerformance" (
    "id" TEXT NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "data_prevista" TIMESTAMP(3) NOT NULL,
    "data_realizado" TIMESTAMP(3),
    "conteudo" JSONB,
    "responsavel" TEXT NOT NULL DEFAULT 'BP',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CicloPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "recurso_id" TEXT,
    "detalhes" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'Apresentação',
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wow_reports" (
    "id" TEXT NOT NULL,
    "sm" TEXT NOT NULL,
    "squad" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "cone" BOOLEAN,
    "cone_text" TEXT,
    "pdti" BOOLEAN,
    "pdti_text" TEXT,
    "parado" BOOLEAN,
    "parado_text" TEXT,
    "wipEpic" BOOLEAN,
    "wip_epic_text" TEXT,
    "wipUs" BOOLEAN,
    "wip_us_text" TEXT,
    "o_que" TEXT,
    "problemas" TEXT,
    "acoes" TEXT,
    "images" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wow_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wow_weekly_reports" (
    "id" TEXT NOT NULL,
    "sm" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "q4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wow_weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wow_squad_reports" (
    "id" TEXT NOT NULL,
    "sm" TEXT NOT NULL,
    "squad" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "notes" TEXT,
    "q1" TEXT,
    "q2" TEXT,
    "q3" TEXT,
    "q4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wow_squad_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wow_squad_overrides" (
    "id" TEXT NOT NULL,
    "sm" TEXT NOT NULL,
    "squad" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wow_squad_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidato_cpf_hash_key" ON "Candidato"("cpf_hash");

-- CreateIndex
CREATE UNIQUE INDEX "VagaCandidato_vaga_id_candidato_id_key" ON "VagaCandidato"("vaga_id", "candidato_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItemStatus_vaga_id_etapa_item_index_key" ON "ChecklistItemStatus"("vaga_id", "etapa", "item_index");

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_cpf_hash_key" ON "Colaborador"("cpf_hash");

-- CreateIndex
CREATE UNIQUE INDEX "HoraExtra_colaborador_id_mes_referencia_key" ON "HoraExtra"("colaborador_id", "mes_referencia");

-- CreateIndex
CREATE UNIQUE INDEX "wow_squad_reports_sm_squad_week_key" ON "wow_squad_reports"("sm", "squad", "week");

-- CreateIndex
CREATE UNIQUE INDEX "wow_squad_overrides_sm_squad_week_field_key" ON "wow_squad_overrides"("sm", "squad", "week", "field");

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaga" ADD CONSTRAINT "Vaga_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaCandidato" ADD CONSTRAINT "VagaCandidato_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VagaCandidato" ADD CONSTRAINT "VagaCandidato_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "Candidato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItemStatus" ADD CONSTRAINT "ChecklistItemStatus_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "Vaga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoraExtra" ADD CONSTRAINT "HoraExtra_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CicloPerformance" ADD CONSTRAINT "CicloPerformance_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
