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
  async atualizarReserva(id, reservaASerAtualizada) {
    try {
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: parseInt(id) },
        data: {
          dataHoraInicio: reservaASerAtualizada.dataHoraInicio,
          dataHoraFim: reservaASerAtualizada.dataHoraFim,
        },
      });
      return {
        status: 200,
        sucess: reservaAtualizada,
      };
    } catch (error) {
      console.error("Erro ao atualizar reserva", error);
      return {
        status: 500,
        error: "Não foi possível atualizar a reserva!",
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
  async obterUmaReservaPorId(id) {
    try {
      const reserva = await prisma.reserva.findUnique({
        where: { id: parseInt(id) },
        include: {
          laboratorio: true,
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
      });
      return {
        status: 200,
        sucess: reserva,
      };
    } catch (error) {
      console.error("Erro ao buscar a reservas", error);
      return {
        status: 500,
        error: "Não foi possível buscar a reserva!",
      };
    }
  },
  async listarReservas(ordemCrescente) {
    try {
      const reservas = await prisma.reserva.findMany(ordemCrescente);
      return {
        status: 200,
        sucess: reservas,
      };
    } catch (error) {
      console.error("Erro ao listar reservas", error);
      return {
        status: 500,
        error: "Não foi possível listar as reservas!",
      };
    }
  },
  async deletarReserva(id) {
    try {
      await prisma.reserva.delete({
        where: { id: parseInt(id) },
      });
      return {
        status: 200,
        sucess: "Reserva cancelada com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao deletar reserva", error);
      return {
        status: 500,
        error: "Não foi possível deletar a reserva!",
      };
    }
  },
};
