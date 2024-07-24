import { PrismaClient } from "@prisma/client";
import {
  isValid,
  isBefore,
  isSameDay,
  differenceInMinutes,
  getMinutes,
} from "date-fns";

// Função para verificar se as datas são válidas e a data de início é menor que a data de fim
const verificarDatasValidas = (dataInicio, dataFim, response) => {
  if (!isValid(dataInicio) || !isValid(dataFim) || dataInicio > dataFim) {
    return response
      .status(400)
      .send({ error: "Datas de início e fim não são válidas." });
  }
};

// Função para verificar se a reserva é futura (data de inicio é depois da data atual)
const verificarReservaFutura = (dataInicio, dataAtual, response) => {
  if (!isBefore(dataAtual, dataInicio)) {
    return response
      .status(400)
      .send({ error: "A data da reserva deve ser futura." });
  }
};

// Função para verificar se a reserva é no mesmo dia (data de início e fim iguais)
const verificarReservaMesmoDia = (dataInicio, dataFim, response) => {
  if (!isSameDay(dataInicio, dataFim)) {
    return response
      .status(400)
      .send({ error: "A reserva deve começar e terminar no mesmo dia." });
  }
};

// Função para verificar a duração mínima da reserva (1 hora)
const verificarDuracaoMinima = (dataInicio, dataFim, response) => {
  const diferencaEmMinutos = differenceInMinutes(dataFim, dataInicio);
  if (diferencaEmMinutos < 60) {
    return response
      .status(400)
      .send({ error: "A reserva deve ter no mínimo 1 hora de duração." });
  }
};

// Função para verificar a restrição de horário da reserva (em horas cheias ou meias horas)
const verificarRestricaoHorario = (dataInicio, dataFim, response) => {
  if (
    getMinutes(dataInicio) % 30 !== 0 ||
    getMinutes(dataFim) % 30 !== 0 ||
    dataInicio.getSeconds() !== 0 ||
    dataFim.getSeconds() !== 0
  ) {
    return response.status(400).send({
      error:
        "A reserva deve começar e terminar em horas cheias ou meias horas.",
    });
  }
};

// Função para verificar conflitos de horários de reserva no mesmo laboratório
const verificarConflitoHorario = async (
  prisma,
  laboratorioId,
  dataInicio,
  dataFim,
  idExclusao,
  response
) => {
  const conflito = await prisma.reserva.findFirst({
    where: {
      laboratorioId,
      ...(idExclusao && { id: { not: idExclusao } }),
      OR: [
        {
          AND: [
            { dataHoraInicio: { lte: dataInicio } },
            { dataHoraFim: { gte: dataInicio } },
          ],
        },
        {
          AND: [
            { dataHoraInicio: { lte: dataFim } },
            { dataHoraFim: { gte: dataFim } },
          ],
        },
        {
          AND: [
            { dataHoraInicio: { gte: dataInicio } },
            { dataHoraFim: { lte: dataFim } },
          ],
        },
      ],
    },
  });

  if (conflito) {
    return response
      .status(400)
      .send({ error: "Conflito de horários de reserva." });
  }
};

// Função para verificar cancelamento com antecedência mínima de 1 hora
const verificarCancelamentoAntecedencia = (
  dataInicioDaReserva,
  dataAtualDoCancelamento,
  response
) => {
  const diferencaEmMinutos = differenceInMinutes(
    dataInicioDaReserva,
    dataAtualDoCancelamento
  );
  if (diferencaEmMinutos < 60) {
    return response.status(400).send({
      error:
        "O cancelamento deve ser feito com pelo menos 1 hora de antecedência.",
    });
  }
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarReserva(request, response) {
    try {
      const { dataHoraInicio, dataHoraFim, laboratorioId } = request.body;

      if (!laboratorioId) {
        return response
          .status(400)
          .send({ error: "ID do laboratório é necessário." });
      }

      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: laboratorioId },
      });

      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }

      if (!laboratorio.ativo) {
        return response
          .status(400)
          .send({ error: "Laboratório está inativo." });
      }

      const dataInicio = new Date(dataHoraInicio);
      const dataFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília

      let resultado;

      resultado = verificarDatasValidas(dataInicio, dataFim, response);
      if (resultado) return; // Se resultado existe, a resposta já foi enviada

      resultado = verificarReservaFutura(dataInicio, dataAtual, response);
      if (resultado) return;

      resultado = verificarReservaMesmoDia(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = verificarDuracaoMinima(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = verificarRestricaoHorario(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = await verificarConflitoHorario(
        prisma,
        laboratorioId,
        dataInicio,
        dataFim,
        null,
        response
      );
      if (resultado) return;

      const reservaCriada = await prisma.reserva.create({
        data: {
          dataHoraInicio,
          dataHoraFim,
          laboratorio: { connect: { id: laboratorioId } },
          usuario: { connect: { id: request.usuarioId } },
        },
      });

      return response.status(201).json(reservaCriada);
    } catch (error) {
      console.error("Erro ao criar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar a reserva." });
    }
  },

  async listarUmaReserva(request, response) {
    try {
      const { id } = request.params;
      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
        include: {
          laboratorio: true,
          usuario: { select: { id: true, nome: true, email: true } },
        },
      });

      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }

      return response.status(200).json(reserva);
    } catch (error) {
      console.error("Erro ao listar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar a reserva." });
    }
  },

  async listarReservas(request, response) {
    try {
      const reservas = await prisma.reserva.findMany({
        orderBy: { dataHoraInicio: "asc" },
        include: {
          laboratorio: true,
          usuario: { select: { id: true, nome: true, email: true } },
        },
      });
      return response.status(200).json(reservas);
    } catch (error) {
      console.error("Erro ao listar reservas", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar as reservas." });
    }
  },

  async atualizarReserva(request, response) {
    try {
      const { id } = request.params;
      const { dataHoraInicio, dataHoraFim } = request.body;

      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });

      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }

      if (reserva.usuarioId !== request.usuarioId) {
        return response.status(403).send({
          error: "Apenas o usuário que criou a reserva pode atualizá-la.",
        });
      }

      const dataInicio = new Date(dataHoraInicio);
      const dataFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      let resultado;

      resultado = verificarDatasValidas(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = verificarReservaFutura(dataInicio, dataAtual, response);
      if (resultado) return;

      resultado = verificarReservaMesmoDia(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = verificarDuracaoMinima(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = verificarRestricaoHorario(dataInicio, dataFim, response);
      if (resultado) return;

      resultado = await verificarConflitoHorario(
        prisma,
        reserva.laboratorioId,
        dataInicio,
        dataFim,
        Number(id),
        response
      );
      if (resultado) return;

      const reservaAtualizada = await prisma.reserva.update({
        where: { id: Number(id) },
        data: { dataHoraInicio, dataHoraFim },
      });

      return response.status(200).json(reservaAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível atualizar a reserva." });
    }
  },

  async deletarReserva(request, response) {
    try {
      const { id } = request.params;
      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });

      if (!reserva) {
        return response.status(404).send({ error: "Reserva não encontrada." });
      }

      if (reserva.usuarioId !== request.usuarioId) {
        return response.status(403).send({
          error: "Apenas o usuário que criou a reserva pode cancelá-la.",
        });
      }

      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      let resultado = verificarCancelamentoAntecedencia(
        reserva.dataHoraInicio,
        dataAtual,
        response
      );
      if (resultado) return;

      await prisma.reserva.delete({
        where: { id: Number(id) },
      });
      return response
        .status(201)
        .send({ message: "Reserva cancelada com sucesso." });
    } catch (error) {
      console.error("Erro ao cancelar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível cancelar a reserva." });
    }
  },
};
