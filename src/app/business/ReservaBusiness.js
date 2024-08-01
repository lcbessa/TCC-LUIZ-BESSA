import { isBefore, isSameDay, differenceInMinutes, getMinutes } from "date-fns";
import ReservaPersistence from "../persistence/ReservaPersistence";
import laboratorioPersistence from "../persistence/LaboratorioPersistence";
export default {
  async criarReserva(reserva) {
    try {
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      // Relação com laboratório( O laboratório deve existir para que a reserva seja feita.)
      const laboratorio = await laboratorioPersistence.obterLaboratorioPorId(
        reserva.laboratorioId
      );
      if (!laboratorio || !laboratorio.ativo) {
        return {
          status: 400,
          error: "Laboratório não existe ou está inativo.",
        };
      }

      // Uma Reserva só pode ser feita para datas futuras, não passadas.
      if (isBefore(reserva.dataHoraInicio, dataAtual)) {
        return {
          status: 400,
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        };
      }

      // A reserva deve ter no mínimo 1 hora de duração.
      if (
        differenceInMinutes(reserva.dataHoraFim, reserva.dataHoraInicio) < 60
      ) {
        return {
          status: 400,
          error: "A reserva deve ter no mínimo 1 hora de duração.",
        };
      }

      // A reserva no mesmo dia (A reserva deve começar e terminar no mesmo dia).
      if (!isSameDay(reserva.dataHoraInicio, reserva.dataHoraFim)) {
        console.log("reserva.dataHoraInicio", reserva.dataHoraInicio);
        console.log("reserva.dataHoraFim", reserva.dataHoraFim);
        return {
          status: 400,
          error: "A reserva deve começar e terminar no mesmo dia.",
        };
      }

      // Restrição de horário da Reserva (A reserva deve começar e terminar em horas cheias ou meias horas.)
      const erroHorario = this.validarHorarioReserva(
        reserva.dataHoraInicio,
        reserva.dataHoraFim
      );
      if (erroHorario) {
        return erroHorario;
      }

      // A reserva não pode ser feita para um laboratório que já tenha uma reserva no mesmo horário.
      const conflitoDeReserva = await this.conflitoReserva(
        reserva.laboratorioId,
        reserva.dataHoraInicio,
        reserva.dataHoraFim
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
  validarHorarioReserva(dataHoraInicio, dataHoraFim) {
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
  },

  async conflitoReserva(laboratorioId, dataHoraInicio, dataHoraFim) {
    const dataReferencia = dataHoraInicio;
    const reservas = await ReservaPersistence.buscarReservasDoDiaDoLaboratorio(
      laboratorioId,
      dataReferencia
    );
    if (reservas.sucess.length > 0) {
      const conflito = reservas.sucess.some((reserva) => {
        return (
          (reserva.dataHoraInicio <= dataHoraInicio &&
            reserva.dataHoraFim >= dataHoraInicio) || // conflito no início
          (reserva.dataHoraInicio <= dataHoraFim &&
            reserva.dataHoraFim >= dataHoraFim) || // Conflito no fim
          (reserva.dataHoraInicio >= dataHoraInicio &&
            reserva.dataHoraFim <= dataHoraFim) // Conflito total
        );
      });
      if (conflito) {
        return {
          status: 400,
          error: "Conflito de horários de reserva",
        };
      }
    }
    return null;
  },
};
