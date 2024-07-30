import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarReserva(novaReserva) {
    try {
      const reservaCriada = await prisma.reserva.create({
        data: novaReserva,
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
  async buscarReservasPorLaboratorio(laboratorioId) {
    const reservasDoLaboratorio = await prisma.reserva.findMany({
      where: {
        laboratorioId: laboratorioId,
      },
      return: {
        status: 200,
        sucess: reservasDoLaboratorio,
      },
    });
  },
};
