-- CreateTable
CREATE TABLE "Laboratorio" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,

    CONSTRAINT "Laboratorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "dataReserva" TIMESTAMP(3) NOT NULL,
    "laboratorioId" INTEGER NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Laboratorio_nome_key" ON "Laboratorio"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratorio_sigla_key" ON "Laboratorio"("sigla");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_laboratorioId_fkey" FOREIGN KEY ("laboratorioId") REFERENCES "Laboratorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
