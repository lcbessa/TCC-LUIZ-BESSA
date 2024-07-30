import { isBefore, isSameDay, differenceInMinutes, getMinutes } from "date-fns";
import ReservaPersistence from "../persistence/ReservaPersistence";

export default {
  async criarReserva(reserva) {
    try {
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      // Uma Reserva só pode ser feita para datas futuras, não passadas.
      if (isBefore(reserva.dataInicio, dataAtual)) {
        return {
          status: 400,
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        };
      }

      // A reserva deve ter no mínimo 1 hora de duração.
      if (differenceInMinutes(reserva.dataFim, reserva.dataInicio) < 60) {
        return {
          status: 400,
          error: "A reserva deve ter no mínimo 1 hora de duração.",
        };
      }

      // A reserva no mesmo dia (A reserva deve começar e terminar no mesmo dia).
      if (!isSameDay(reserva.dataInicio, reserva.dataFim)) {
        return response.status(400).send({
          error: "A reserva deve começar e terminar no mesmo dia.",
        });
      }

      // Restrição de horário da Reserva (A reserva deve começar e terminar em horas cheias ou meias horas.)
      const erroHorario = this.validarHorarioReserva(
        reserva.dataInicio,
        reserva.dataFim
      );
      if (erroHorario) {
        return erroHorario;
      }

      // A reserva não pode ser feita para um laboratório que já tenha uma reserva no mesmo horário.
      const conflitoDeReserva = await this.conflitoReserva(
        reserva.laboratorioId,
        reserva.dataInicio,
        reserva.dataFim
      );

      if (conflitoDeReserva) {
        return conflitoDeReserva;
      }

      return await ReservaPersistence.criarReserva(reserva);
    } catch (error) {
      console.error("Erro ao criar reserva", error);
      return {
        status: 500,
        error: "Não foi possível criar uma reserva!",
      };
    }
  },

  // Métodos auxiliares
  validarHorarioReserva(dataInicio, dataFim) {
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
  },

  async conflitoReserva(laboratorioId, dataInicio, dataFim) {
    const reservas = await ReservaPersistence.buscarReservasPorLaboratorio(
      laboratorioId
    );
    if (reservas.sucess) {
      for (const reserva of reservas) {
        if (
          (isBefore(dataInicio, reserva.dataInicio) &&
            isBefore(dataFim, reserva.dataInicio)) ||
          (isBefore(reserva.dataFim, dataInicio) &&
            isBefore(reserva.dataFim, dataFim))
        ) {
          return {
            status: 400,
            error: "Conflito de horários de reserva",
          };
        }
      }
    }
  },
};
