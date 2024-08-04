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
      let { dataHoraInicio, dataHoraFim, laboratorioId } = request.body;

      // Relação com Laboratório (Verifica se o laboratório está ativo)
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: laboratorioId },
      });

      if (!laboratorio || !laboratorio.ativo) {
        return response
          .status(400)
          .send({ error: "Laboratório não encontrado ou inativo." });
      }

      dataHoraInicio = new Date(dataHoraInicio);
      dataHoraFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília

      // Verificar se as datas e horas são válidas
      if (!isValid(dataHoraInicio) || !isValid(dataHoraFim)) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva não são válidas.",
        });
      }

      // Verificar se a data e hora de início são menores ou iguais à data e hora de fim.
      if (dataHoraInicio > dataHoraFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }

      // Reservas não devem possuir dataHoraInicio e dataHoraFim devem ser obrigatórios
      if (!dataHoraInicio || !dataHoraFim) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva devem ser fornecidas.",
        });
      }

      // Reservas Futuras Apenas (A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.)
      if (isBefore(dataHoraInicio, dataAtual)) {
        return response.status(400).send({
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        });
      }

      // Reserva no Mesmo Dia (A reserva deve começar e terminar no mesmo dia.)
      if (!isSameDay(dataHoraInicio, dataHoraFim)) {
        return response.status(400).send({
          error: "A reserva deve começar e terminar no mesmo dia.",
        });
      }
      // Duração Mínima de Reserva (A reserva deve ter no mínimo 1 hora de duração.)
      const diferencaEmMinutos = differenceInMinutes(
        dataHoraFim,
        dataHoraInicio
      );
      if (diferencaEmMinutos < 60) {
        return response
          .status(400)
          .send({ error: "A reserva deve ter no mínimo 1 hora de duração." });
      }

      // 	Restrição de horário da Reserva (A reserva deve começar e terminar em horas cheias ou meias horas.)
      if (
        getMinutes(dataHoraInicio) % 30 !== 0 ||
        getMinutes(dataHoraFim) % 30 !== 0 ||
        dataHoraInicio.getSeconds() !== 0 ||
        dataHoraFim.getSeconds() !== 0
      ) {
        return response.status(400).send({
          error:
            "A reserva deve começar e terminar em horas cheias ou meias horas.",
        });
      }

      // Conflito de Horários de Reserva (Não pode haver conflito de horários de reserva)
      const conflito = await prisma.reserva.findFirst({
        where: {
          laboratorioId,
          OR: [
            {
              // A nova reserva começa durante uma reserva existente
              AND: [
                { dataHoraInicio: { lte: dataHoraInicio } }, // A reserva existente começa antes ou no mesmo instante que a nova reserva
                { dataHoraFim: { gte: dataHoraInicio } }, // A reserva existente termina depois ou no mesmo instante que o início da nova reserva
              ],
            },
            {
              // A nova reserva termina durante uma reserva existente
              AND: [
                { dataHoraInicio: { lte: dataHoraFim } }, // A reserva existente começa antes ou no mesmo instante que o fim da nova reserva
                { dataHoraFim: { gte: dataHoraFim } }, // A reserva existente termina depois ou no mesmo instante que o fim da nova reserva
              ],
            },
            {
              // A nova reserva engloba completamente uma reserva existente
              AND: [
                { dataHoraInicio: { gte: dataHoraInicio } }, // A reserva existente começa depois ou no mesmo instante que o início da nova reserva
                { dataHoraFim: { lte: dataHoraFim } }, // A reserva existente termina antes ou no mesmo instante que o fim da nova reserva
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
          laboratorio: {
            connect: { id: laboratorioId },
          },
          usuario: {
            connect: { id: request.usuarioId },
          },
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
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
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
        orderBy: {
          dataHoraInicio: "asc",
        },
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
      let { dataHoraInicio, dataHoraFim } = request.body;

      // Verifica se a reserva existe
      const reserva = await prisma.reserva.findUnique({
        where: { id: Number(id) },
      });

      if (!reserva) {
        return response.status(400).send({ error: "Reserva não encontrada." });
      }

      // Verifica se o usuário que está tentando atualizar a reserva é o mesmo que a criou
      if (reserva.usuarioId !== request.usuarioId) {
        return response.status(403).send({
          error: "Apenas o usuário que criou a reserva pode atualizá-la.",
        });
      }
      dataHoraInicio = new Date(dataHoraInicio);
      dataHoraFim = new Date(dataHoraFim);
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      // Verificar se as datas e horas são válidas
      if (!isValid(dataHoraInicio) || !isValid(dataHoraFim)) {
        return response.status(400).send({
          error: "As datas de início e fim da reserva não são válidas.",
        });
      }

      // Verificar se a data e hora de início são menores ou iguais à data e hora de fim.
      if (dataHoraInicio > dataHoraFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }
      if (reserva.dataHoraFim < dataAtual) {
        return response
          .status(400)
          .send({ error: "Reserva não pode ser atualizada, pois já ocorreu." });
      }

      // Reservas Futuras Apenas (A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.)
      if (isBefore(dataHoraInicio, dataAtual)) {
        return response.status(400).send({
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        });
      }

      // Reserva no Mesmo Dia (A reserva deve começar e terminar no mesmo dia.)
      if (!isSameDay(dataHoraInicio, dataHoraFim)) {
        return response.status(400).send({
          error: "A reserva deve começar e terminar no mesmo dia.",
        });
      }
      // Duração Mínima de Reserva (A reserva deve ter no mínimo 1 hora de duração.)
      const diferencaEmMinutos = differenceInMinutes(
        dataHoraFim,
        dataHoraInicio
      );
      if (diferencaEmMinutos < 60) {
        return response
          .status(400)
          .send({ error: "A reserva deve ter no mínimo 1 hora de duração." });
      }
      // Condicao de Horário da Reserva (A reserva deve começar e terminar em horas cheias ou meias horas.)
      if (
        getMinutes(dataHoraInicio) % 30 !== 0 ||
        getMinutes(dataHoraFim) % 30 !== 0 ||
        dataHoraInicio.getSeconds() !== 0 ||
        dataHoraFim.getSeconds() !== 0
      ) {
        return response.status(400).send({
          error:
            "A reserva deve começar e terminar em horas cheias ou meias horas.",
        });
      }

      // Conflito de Horários de Reserva (Não pode haver conflito de horários de reserva)
      const conflito = await prisma.reserva.findFirst({
        where: {
          OR: [
            {
              // A nova reserva começa durante uma reserva existente
              AND: [
                { dataHoraInicio: { lte: dataHoraInicio } }, // A reserva existente começa antes ou no mesmo instante que a nova reserva
                { dataHoraFim: { gte: dataHoraInicio } }, // A reserva existente termina depois ou no mesmo instante que o início da nova reserva
              ],
            },
            {
              // A nova reserva termina durante uma reserva existente
              AND: [
                { dataHoraInicio: { lte: dataHoraFim } }, // A reserva existente começa antes ou no mesmo instante que o fim da nova reserva
                { dataHoraFim: { gte: dataHoraFim } }, // A reserva existente termina depois ou no mesmo instante que o fim da nova reserva
              ],
            },
            {
              // A nova reserva engloba completamente uma reserva existente
              AND: [
                { dataHoraInicio: { gte: dataHoraInicio } }, // A reserva existente começa depois ou no mesmo instante que o início da nova reserva
                { dataHoraFim: { lte: dataHoraFim } }, // A reserva existente termina antes ou no mesmo instante que o fim da nova reserva
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

      // Verifica se o usuário que está tentando cancelar a reserva é o mesmo que a criou
      if (reserva.usuarioId !== request.usuarioId) {
        return response.status(403).send({
          error: "Apenas o usuário que criou a reserva pode deletá-la.",
        });
      }

      // Se o cancelamento da reserva for feito com menos de 1 hora de antecedência, a reserva não poderá ser cancelada.
      const dataAtualDoCancelamento = new Date();
      dataAtualDoCancelamento.setHours(dataAtualDoCancelamento.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília
      const dataHoraInicioDaReservaQuePoderaSerCancelada = new Date(
        reserva.dataHoraInicio
      );
      const diferencaEmMinutos = differenceInMinutes(
        dataHoraInicioDaReservaQuePoderaSerCancelada,
        dataAtualDoCancelamento
      );
      if (diferencaEmMinutos < 60) {
        return response.status(400).send({
          error:
            "A reserva não pode ser cancelada com menos de 1 hora de antecedência.",
        });
      }

      await prisma.reserva.delete({
        where: { id: Number(id) },
      });

      return response
        .status(200)
        .send({ message: "Reserva cancelada com sucesso." });
    } catch (error) {
      console.error("Erro ao cancelar reserva", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao cancelar a reserva." });
    }
  },
};
