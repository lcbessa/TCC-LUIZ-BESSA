import LaboratorioPersistence from "../persistence/LaboratorioPersistence";

export default {
  async criarLaboratorio(novoLaboratorio) {
    try {
      let resposta = null;
      resposta = await this.obterLaboratorioPorNome(novoLaboratorio.nome);

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesmo nome já existe.",
        };
      }

      resposta = await this.obterLaboratorioPorSigla(novoLaboratorio.sigla);

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

  async obterLaboratorioPorNome(nome) {
    return await LaboratorioPersistence.obterLaboratorioPorNome(nome);
  },
  async obterLaboratorioPorSigla(sigla) {
    return await LaboratorioPersistence.obterLaboratorioPorSigla(sigla);
  },
};
