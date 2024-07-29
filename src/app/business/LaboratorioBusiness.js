import LaboratorioPersistence from "../persistence/LaboratorioPersistence";

export default {
  async criarLaboratorio(novoLaboratorio) {
    try {
      let resposta = null;
      resposta = await this.obterLaboratorioPorCampo(
        null,
        "nome",
        novoLaboratorio.nome
      );
      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesmo nome já existe.",
        };
      }

      resposta = await this.obterLaboratorioPorCampo(
        null,
        "sigla",
        novoLaboratorio.sigla
      );

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesma sigla já existe.",
        };
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
      let resposta = null;
      resposta = await this.obterLaboratorioPorId(id);
      return resposta;
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
      let resposta = null;
      resposta = await this.obterLaboratorioPorId(id);

      if (!resposta.sucess || !resposta.sucess.ativo) {
        return {
          status: 404,
          error: "Laboratório não encontrado ou inativo!",
        };
      }

      resposta = await this.obterLaboratorioPorCampo(
        id,
        "nome",
        laboratorioASerAtualizado.nome
      );

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesmo nome já existe.",
        };
      }

      resposta = await this.obterLaboratorioPorCampo(
        id,
        "sigla",
        laboratorioASerAtualizado.sigla
      );

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesma sigla já existe.",
        };
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
  // Métodos auxiliares
  async obterLaboratorioPorId(id) {
    let resposta = await LaboratorioPersistence.obterLaboratorioPorId(id);
    if (!resposta.sucess) {
      return {
        status: 404,
        error: "Laboratório não encontrado!",
      };
    }
    return resposta;
  },
  async obterLaboratorioPorCampo(id, campo, nomeCampo) {
    return await LaboratorioPersistence.obterLaboratorioPorCampo(
      id,
      campo,
      nomeCampo
    );
  },
};
