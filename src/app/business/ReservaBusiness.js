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
      if (!laboratorio.sucess || !laboratorio.sucess.ativo) {
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
  async listarUmaReserva(id) {
    try {
      const ReservaProcurada = await ReservaPersistence.obterUmaReservaPorId(
        id
      );
      if (!ReservaProcurada.sucess) {
        return {
          status: 404,
          error: "Reserva não encontrada!",
        };
      }
      return ReservaProcurada;
    } catch (error) {
      console.error("Erro ao listar uma reserva", error);
      return {
        status: 500,
        error: "Não foi possível listar a reserva!",
      };
    }
  },
  async listarReservas() {
    try {
      return await ReservaPersistence.listarReservas({
        orderBy: { dataHoraInicio: "asc" },
      });
    } catch (error) {
      console.error("Erro ao listar reservas", error);
      return {
        status: 500,
        error: "Não foi possível listar as reservas!",
      };
    }
  },
  async atualizarReserva(id, reservaASerAtualizada) {
    try {
      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() - 3);

      const ReservaProcurada = await ReservaPersistence.obterUmaReservaPorId(
        id
      );
      if (!ReservaProcurada.sucess) {
        return {
          status: 404,
          error: "Reserva não encontrada!",
        };
      }
      console.log("ReservaProcurada", ReservaProcurada);
      console.log("reservaASerAtualizada", reservaASerAtualizada);
      // Verifica se o usuário que está tentando atualizar a reserva é o mesmo que a criou
      if (
        reservaASerAtualizada.usuarioId !== ReservaProcurada.sucess.usuario.id
      ) {
        return {
          status: 403,
          error: "Apenas o usuário que criou a reserva pode atualizá-la.",
        };
      }

      // Uma Reserva só pode ser feita para datas futuras, não passadas.
      if (isBefore(reservaASerAtualizada.dataHoraInicio, dataAtual)) {
        return {
          status: 400,
          error:
            "A data da reserva deve ser uma data futura ou o dia de hoje com hora futura.",
        };
      }

      // A reserva deve ter no mínimo 1 hora de duração.
      if (
        differenceInMinutes(
          reservaASerAtualizada.dataHoraFim,
          reservaASerAtualizada.dataHoraInicio
        ) < 60
      ) {
        return {
          status: 400,
          error: "A reserva deve ter no mínimo 1 hora de duração.",
        };
      }

      // A reserva no mesmo dia (A reserva deve começar e terminar no mesmo dia).
      if (
        !isSameDay(
          reservaASerAtualizada.dataHoraInicio,
          reservaASerAtualizada.dataHoraFim
        )
      ) {
        return {
          status: 400,
          error: "A reserva deve começar e terminar no mesmo dia.",
        };
      }

      // Restrição de horário da Reserva (A reserva deve começar e terminar em horas cheias ou meias horas.)
      const erroHorario = this.validarHorarioReserva(
        reservaASerAtualizada.dataHoraInicio,
        reservaASerAtualizada.dataHoraFim
      );
      if (erroHorario) {
        return erroHorario;
      }

      // A reserva não pode ser feita para um laboratório que já tenha uma reserva no mesmo horário.
      const conflitoDeReserva = await this.conflitoReserva(
        ReservaProcurada.sucess.laboratorio.id,
        reservaASerAtualizada.dataHoraInicio,
        reservaASerAtualizada.dataHoraFim
      );

      if (conflitoDeReserva) {
        return conflitoDeReserva;
      }

      return await ReservaPersistence.atualizarReserva(
        id,
        reservaASerAtualizada
      );
    } catch (error) {
      console.error("Erro ao atualizar reserva", error);
      return {
        status: 500,
        error: "Não foi possível atualizar a reserva!",
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
