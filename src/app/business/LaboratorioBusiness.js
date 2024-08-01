import LaboratorioPersistence from "../persistence/LaboratorioPersistence";

export default {
  async criarLaboratorio(novoLaboratorio) {
    try {
      const validacaoNome = await this.validarCampoUnico(
        null,
        "nome",
        novoLaboratorio.nome
      );
      if (validacaoNome) {
        return validacaoNome;
      }

      const validacaoSigla = await this.validarCampoUnico(
        null,
        "sigla",
        novoLaboratorio.sigla
      );
      if (validacaoSigla) {
        return validacaoSigla;
      }
      return await LaboratorioPersistence.criarLaboratorio(novoLaboratorio);
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível criar um laboratório!",
      };
    }
  },
  async listarLaboratorios() {
    try {
      // Listar laboratórios em ordem alfabética crescente
      return await LaboratorioPersistence.listarLaboratorios({
        orderBy: {
          nome: "asc",
        },
        include: { reservas: true },
      });
    } catch (error) {
      console.error("Erro ao listar laboratórios", error);
      return {
        status: 500,
        error: "Não foi possível listar os laboratórios!",
      };
    }
  },
  async listarUmLaboratorio(id) {
    try {
      const laboratorioProcurado = await this.obterLaboratorioPorId(id);
      if (!laboratorioProcurado.sucess || !laboratorioProcurado.sucess.ativo) {
        return {
          status: 400,
          error: "Laboratório não encontrado ou inativo!",
        };
      }
      return laboratorioProcurado;
    } catch (error) {
      console.error("Erro ao listar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível listar o laboratório!",
      };
    }
  },
  async atualizarLaboratorio(id, laboratorioASerAtualizado) {
    try {
      const laboratorioProcurado = await this.obterLaboratorioPorId(id);

      if (!laboratorioProcurado.sucess || !laboratorioProcurado.sucess.ativo) {
        return {
          status: 404,
          error: "Laboratório não encontrado ou inativo!",
        };
      }

      const validacaoNome = await this.validarCampoUnico(
        id,
        "nome",
        laboratorioASerAtualizado.nome
      );
      if (validacaoNome) {
        return validacaoNome;
      }
      const validacaoSigla = await this.validarCampoUnico(
        id,
        "sigla",
        laboratorioASerAtualizado.sigla
      );
      if (validacaoSigla) {
        return validacaoSigla;
      }
      return await LaboratorioPersistence.atualizarLaboratorio(
        id,
        laboratorioASerAtualizado
      );
    } catch (error) {
      console.error("Erro ao atualizar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível atualizar o laboratório!",
      };
    }
  },
  async deletarLaboratorio(id) {
    try {
      let laboratorioASerExcluido = null;
      laboratorioASerExcluido = await this.obterLaboratorioPorId(id);
      if (!laboratorioASerExcluido.sucess) {
        return {
          status: 404,
          error: "Laboratório não encontrado!",
        };
      }
      console.log(laboratorioASerExcluido);
      if (!laboratorioASerExcluido.sucess.reservas.length) {
        return await LaboratorioPersistence.deletarLaboratorio(id);
      } else {
        const dataAtual = new Date();
        console.log(dataAtual);
        const reservasFuturas = laboratorioASerExcluido.sucess.reservas.filter(
          (reserva) => reserva.dataHoraInicio >= dataAtual
        );
        console.log(reservasFuturas);
        if (reservasFuturas.length === 0) {
          await LaboratorioPersistence.desativarLaboratorio(id);
          return {
            status: 200,
            sucess: "Laboratório desativado com sucesso!",
          };
        } else {
          return {
            status: 400,
            error:
              "Laboratório não pode ser desativado, pois tem reservas futuras ou em andamento!",
          };
        }
      }
    } catch (error) {
      console.error("Erro ao deletar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível deletar o laboratório!",
      };
    }
  },
  // Métodos auxiliares
  async obterLaboratorioPorId(id) {
    return await LaboratorioPersistence.obterLaboratorioPorId(id);
  },
  async validarCampoUnico(id, campo, valorCampo) {
    const campoProcurado =
      await LaboratorioPersistence.obterLaboratorioPorCampo(
        id,
        campo,
        valorCampo
      );
    if (campoProcurado.sucess) {
      return {
        status: 400,
        error: `${campo} já existente.`,
      };
    }
    return null;
  },
};
