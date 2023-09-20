import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarReserva(request, response) {
    try {
      const { dataReserva, laboratorioId } = request.body;

      const laboratorioExistente = await prisma.laboratorio.findUnique({
        where: {
          id: laboratorioId,
        },
      });

      if (!laboratorioExistente) {
        return response
          .status(400)
          .json({ error: "Laboratório não encontrado." });
      }
      const dataFormatada = new Date(dataReserva + "T23:59:59.000Z");
      const dataAtual = new Date();

      if (dataFormatada < dataAtual) {
        return response.status(400).json({
          error: "A data de reserva deve ser igual ou posterior à data atual.",
        });
      }

      const reservaConflitante = await prisma.reserva.findFirst({
        where: {
          laboratorioId,
          dataReserva: dataFormatada,
        },
      });

      if (reservaConflitante) {
        return response.status(400).json({
          error:
            "Já existe uma reserva conflitante para o mesmo laboratório no mesmo dia.",
        });
      }

      const novaReserva = await prisma.reserva.create({
        data: { dataReserva: dataFormatada, laboratorioId },
      });

      return response.status(201).json(novaReserva);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Erro ao criar reserva." });
    }
  },
  async listarReservas(request, response) {
    try {
      const reservas = await prisma.reserva.findMany();
      return response.status(200).json(reservas);
    } catch (error) {
      console.error("Erro ao listar reservas", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar reservas!" });
    }
  },
  async listarUmaReserva(request, response) {
    try {
      const { id } = request.params;
      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }
      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });
      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }
      return response.status(200).json(reserva);
    } catch (error) {
      console.error("Erro ao listar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar reserva!" });
    }
  },
  async atualizarReserva(request, response) {
    try {
      const { id } = request.params;
      const { dataReserva } = request.body;

      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }
      let reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });
      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }

      const dataFormatada = new Date(dataReserva + "T23:59:59.000Z");
      const dataAtual = new Date();

      if (dataFormatada < dataAtual) {
        return response.status(400).json({
          error:
            "A nova data de reserva deve ser igual ou posterior à data atual.",
        });
      }

      const reservaConflitante = await prisma.reserva.findFirst({
        where: {
          dataReserva: dataFormatada,
          NOT: { id: Number(id) },
        },
      });

      if (reservaConflitante) {
        return response.status(400).json({
          error:
            "Já existe uma reserva conflitante para o mesmo laboratório no mesmo dia.",
        });
      }
      reserva = await prisma.reserva.update({
        where: { id: Number(id) },
        data: {
          dataReserva: dataFormatada,
        },
      });
      return response.status(200).json(reserva);
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Erro ao atualizar reserva." });
    }
  },
  async deletarReserva(request, response) {
    try {
      const { id } = request.params;

      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }

      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });

      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }

      await prisma.reserva.delete({
        where: { id: Number(id) },
      });

      return response
        .status(200)
        .send({ message: "Reserva excluída com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir reserva", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao excluir reserva." });
    }
  },
};
