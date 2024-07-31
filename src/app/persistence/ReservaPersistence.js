import { PrismaClient } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

export default {
  async criarReserva(novaReserva) {
    try {
      const reservaCriada = await prisma.reserva.create({
        data: {
          dataHoraInicio: novaReserva.dataHoraInicio,
          dataHoraFim: novaReserva.dataHoraFim,
          laboratorio: {
            connect: { id: novaReserva.laboratorioId },
          },
          usuario: {
            connect: { id: novaReserva.usuarioId },
          },
        },
      });
      return {
        status: 201,
        sucess: reservaCriada,
      };
    } catch (error) {
      console.error("Erro ao criar reserva", error);
      return {
        status: 500,
        error: "Não foi possível criar uma reserva!",
      };
    }
  },
  async buscarReservasDoDiaDoLaboratorio(laboratorioId, dataReferencia) {
    const inicioDoDia = startOfDay(dataReferencia);
    inicioDoDia.setHours(inicioDoDia.getHours() - 3);
    console.log("inicioDoDia", inicioDoDia);

    const fimDoDia = endOfDay(dataReferencia);
    fimDoDia.setHours(fimDoDia.getHours() - 3);
    console.log("fimDoDia", fimDoDia);

    const reservasDoLaboratorio = await prisma.reserva.findMany({
      where: {
        laboratorioId: Number(laboratorioId),
        dataHoraInicio: { gte: inicioDoDia },
        dataHoraFim: { lte: fimDoDia },
      },
    });
    console.log("reservasDoLaboratorio", reservasDoLaboratorio);
    return {
      status: 200,
      sucess: reservasDoLaboratorio,
    };
  },
};
