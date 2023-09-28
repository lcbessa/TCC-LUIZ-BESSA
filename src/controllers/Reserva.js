import { PrismaClient } from "@prisma/client";
import {
  isValid,
  isBefore,
  isSameDay,
  differenceInMinutes,
  getMinutes,
} from "date-fns";

const prisma = new PrismaClient();

export default {
  async criarReserva(request, response) {
    try {
      const { dataHoraInicio, dataHoraFim, laboratorioId } = request.body;

      // [RN006] Relação com Laboratório (Verifica se o laboratório existe)
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: laboratorioId },
      });

      if (!laboratorio) {
        return response
          .status(400)
          .send({ error: "Laboratório não encontrado." });
      }

      const dataInicio = new Date(dataHoraInicio);
      const dataFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      // Verificar se as datas e horas são válidas
      if (!isValid(dataInicio) || !isValid(dataFim)) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva não são válidas.",
        });
      }

      // Verificar se a data e hora de início são menores ou iguais à data e hora de fim.
      if (dataInicio > dataFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }

      // [RN007] Reservas não devem possuir dataHoraInicio e dataHoraFim nulos
      if (!dataHoraInicio || !dataHoraFim) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva devem ser fornecidas.",
        });
      }

      // [RN008] Reservas Futuras Apenas
      if (isBefore(dataInicio, dataAtual)) {
        return response.status(400).send({
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        });
      }

      // 	[RN009] Reserva no Mesmo Dia
      if (!isSameDay(dataInicio, dataFim)) {
        return response.status(400).send({
          error: "A reserva deve começar e terminar no mesmo dia.",
        });
      }
      // [RN010] Duração Mínima de Reserva
      const diferencaEmMinutos = differenceInMinutes(dataFim, dataInicio);
      if (diferencaEmMinutos < 60) {
        return response
          .status(400)
          .send({ error: "A reserva deve ter no mínimo 1 hora de duração." });
      }

      // 	[RN011] - Restrição de horário da Reserva:
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

      // [RN011] Restrição de Conflito de Horários de Reserva
      const conflito = await prisma.reserva.findFirst({
        where: {
          laboratorioId,
          OR: [
            {
              AND: [
                { dataHoraInicio: { lte: dataInicio } }, // Início da primeira reserva é anterior ou igual ao início da nova reserva
                { dataHoraFim: { gte: dataInicio } }, // Fim da primeira reserva é posterior ou igual ao início da nova reserva
              ],
            },
            {
              AND: [
                { dataHoraInicio: { lte: dataFim } }, // Início da primeira reserva é anterior ou igual ao fim da nova reserva
                { dataHoraFim: { gte: dataFim } }, // Fim da primeira reserva é posterior ou igual ao fim da nova reserva
              ],
            },
            {
              AND: [
                { dataHoraInicio: { gte: dataInicio } }, // Início da primeira reserva é posterior ou igual ao início da nova reserva
                { dataHoraFim: { lte: dataFim } }, // Fim da primeira reserva é anterior ou igual ao fim da nova reserva
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

      const reservaCriada = await prisma.reserva.create({
        data: {
          dataHoraInicio,
          dataHoraFim,
          laboratorioId,
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
        include: { laboratorio: true },
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
        include: { laboratorio: true },
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
      const { id } = request.params; // Recebe o ID da reserva a ser atualizada
      const { dataHoraInicio, dataHoraFim } = request.body;

      // [RN006] Relação com Laboratório (Verifica se o laboratório existe)
      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });

      if (!reserva) {
        return response.status(400).send({ error: "Reserva não encontrada." });
      }

      const dataInicio = new Date(dataHoraInicio);
      const dataFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      // Verificar se as datas e horas são válidas
      if (!isValid(dataInicio) || !isValid(dataFim)) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva não são válidas.",
        });
      }

      // Verificar se a data e hora de início são menores ou iguais à data e hora de fim.
      if (dataInicio > dataFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }

      // [RN008] Reservas Futuras Apenas
      if (isBefore(dataInicio, dataAtual)) {
        return response.status(400).send({
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        });
      }

      // [RN009] Reserva no Mesmo Dia
      if (!isSameDay(dataInicio, dataFim)) {
        return response.status(400).send({
          error: "A reserva deve começar e terminar no mesmo dia.",
        });
      }
      // [RN010] Duração Mínima de Reserva
      const diferencaEmMinutos = differenceInMinutes(dataFim, dataInicio);
      if (diferencaEmMinutos < 60) {
        return response
          .status(400)
          .send({ error: "A reserva deve ter no mínimo 1 hora de duração." });
      }
      // [RN011] - Restrição de horário da Reserva:
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

      // [RN011] Restrição de Conflito de Horários de Reserva
      const conflito = await prisma.reserva.findFirst({
        where: {
          OR: [
            {
              AND: [
                { dataHoraInicio: { lte: dataInicio } }, // Início da primeira reserva é anterior ou igual ao início da nova reserva
                { dataHoraFim: { gte: dataInicio } }, // Fim da primeira reserva é posterior ou igual ao início da nova reserva
              ],
            },
            {
              AND: [
                { dataHoraInicio: { lte: dataFim } }, // Início da primeira reserva é anterior ou igual ao fim da nova reserva
                { dataHoraFim: { gte: dataFim } }, // Fim da primeira reserva é posterior ou igual ao fim da nova reserva
              ],
            },
            {
              AND: [
                { dataHoraInicio: { gte: dataInicio } }, // Início da primeira reserva é posterior ou igual ao início da nova reserva
                { dataHoraFim: { lte: dataFim } }, // Fim da primeira reserva é anterior ou igual ao fim da nova reserva
              ],
            },
          ],
          NOT: { id: Number(id) }, // Exclui a própria reserva da verificação de conflitos
        },
      });

      if (conflito) {
        return response
          .status(400)
          .send({ error: "Conflito de horários de reserva." });
      }

      // Atualiza a reserva no banco de dados
      const reservaAtualizada = await prisma.reserva.update({
        where: { id: Number(id) },
        data: {
          dataHoraInicio,
          dataHoraFim,
        },
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
        .send({ error: "Erro interno ao excluir a reserva." });
    }
  },
};
