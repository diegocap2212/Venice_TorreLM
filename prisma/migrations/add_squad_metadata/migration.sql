CREATE TABLE "squad_metadata" (
    "id" TEXT NOT NULL,
    "squad" TEXT NOT NULL,
    "torre" TEXT,
    "objetivo" TEXT,
    "ponto_focal" TEXT,
    "stack" TEXT,
    "cerimonias" TEXT,
    "acessos" TEXT,
    "saude" TEXT NOT NULL DEFAULT 'BOA',
    "notas_sdm" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "squad_metadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "squad_metadata_squad_key" ON "squad_metadata"("squad");
