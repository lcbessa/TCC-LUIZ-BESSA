import { PrismaClient } from "@prisma/client";
import { isValid } from "date-fns";
import { validarId, verificarCampoObrigatorio } from "../../utils/validacoes";
import ReservaBusiness from "../business/ReservaBusiness";

const prisma = new PrismaClient();

export default {
  async criarReserva(request, response) {
    try {
      let { dataHoraInicio, dataHoraFim, laboratorioId } = request.body;
      const { usuarioId } = request;

      dataHoraInicio = new Date(dataHoraInicio);
      dataHoraFim = new Date(dataHoraFim);
      const dataAtual = new Date();

      dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília

      let resposta = null;

      resposta = verificarCampoObrigatorio(
        dataHoraInicio,
        "Data e hora de início"
      );
      if (resposta) return response.status(400).send(resposta);

      resposta = verificarCampoObrigatorio(dataHoraFim, "Data e hora de fim");
      if (resposta) return response.status(400).send(resposta);

      resposta = verificarCampoObrigatorio(laboratorioId, "Laboratório");
      if (resposta) return response.status(400).send(resposta);

      resposta = validarId(laboratorioId);
      if (resposta) return response.status(400).send(resposta);

      resposta = isValid(dataHoraInicio);
      if (!resposta) {
        return response.status(400).send({
          error: "A data e hora de início da reserva não são válidas.",
        });
      }

      resposta = isValid(dataHoraFim);
      if (!resposta) {
        return response.status(400).send({
          error: "A data e hora de fim da reserva não são válidas.",
        });
      }

      if (dataHoraInicio > dataHoraFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }

      resposta = await ReservaBusiness.criarReserva({
        dataHoraInicio,
        dataHoraFim,
        laboratorioId,
        usuarioId,
      });
      return response.status(resposta.status).json(resposta);
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

      let resposta = validarId(id);
      if (resposta) return response.status(400).send(resposta);

      resposta = await ReservaBusiness.listarUmaReserva(id);
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar a reserva." });
    }
  },
  async listarReservas(request, response) {
    try {
      const resposta = await ReservaBusiness.listarReservas();
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar reservas", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar as reservas." });
    }
  },
  async atualizarReserva(request, response) {
    try {
      const { usuarioId } = request;
      const { id } = request.params;
      let { dataHoraInicio, dataHoraFim } = request.body;

      dataHoraInicio = new Date(dataHoraInicio);
      dataHoraFim = new Date(dataHoraFim);
      const dataAtual = new Date();

      dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília

      let resposta = null;

      resposta = validarId(id);
      if (resposta) return response.status(400).send(resposta);

      resposta = verificarCampoObrigatorio(
        dataHoraInicio,
        "Data e hora de início"
      );
      if (resposta) return response.status(400).send(resposta);

      resposta = verificarCampoObrigatorio(dataHoraFim, "Data e hora de fim");
      if (resposta) return response.status(400).send(resposta);

      resposta = isValid(dataHoraInicio);
      if (!resposta) {
        return response.status(400).send({
          error: "A data e hora de início da reserva não são válidas.",
        });
      }

      resposta = isValid(dataHoraFim);
      if (!resposta) {
        return response.status(400).send({
          error: "A data e hora de fim da reserva não são válidas.",
        });
      }

      if (dataHoraInicio > dataHoraFim) {
        return response.status(400).send({
          error:
            "A data e hora de início não podem ser maiores que a data e hora de fim.",
        });
      }

      resposta = await ReservaBusiness.atualizarReserva(id, {
        dataHoraInicio,
        dataHoraFim,
        usuarioId,
      });
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao criar reserva", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar a reserva." });
    }
  },
  async deletarReserva(request, response) {
    try {
      const { id } = request.params;
      const { usuarioId } = request;
      let resposta = validarId(id);
      if (resposta) return response.status(400).send(resposta);

      resposta = await ReservaBusiness.deletarReserva(id, usuarioId);
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao cancelar reserva", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao cancelar a reserva." });
    }
  },
};
