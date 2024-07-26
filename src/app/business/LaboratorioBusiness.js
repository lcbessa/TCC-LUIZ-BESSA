import LaboratorioPersistence from "../persistence/LaboratorioPersistence";

export default {
  async criarLaboratorio(novoLaboratorio) {
    try {
      let resposta = null;
      resposta = await this.obterLaboratorioPorCampo(
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

  async obterLaboratorioPorCampo(campo, nomeCampo) {
    return await LaboratorioPersistence.obterLaboratorioPorCampo(
      campo,
      nomeCampo
    );
  },
};
