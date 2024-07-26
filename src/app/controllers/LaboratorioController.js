import LaboratorioBusiness from "../business/LaboratorioBusiness";

export default {
  async criarLaboratorio(request, response) {
    try {
      const { nome, sigla } = request.body;
      let resposta = null;
      // Verifica se os campos obrigatórios estão presentes
      resposta = verificarCampoObrigatorio(nome, "nome");
      if (resposta) return response.status(resposta.status).json(resposta);
      resposta = verificarCampoObrigatorio(sigla, "sigla");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await LaboratorioBusiness.criarLaboratorio({
        nome,
        sigla,
      });

      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return response.status(500).json({
        status: 500,
        error: "Não foi possível criar um laboratório!",
      });
    }
  },
  async listarLaboratorios(request, response) {
    try {
      const resposta = await LaboratorioBusiness.listarLaboratorios();
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar laboratórios", error);
      return response.status(500).json({
        status: 500,
        error: "Não foi possível listar os laboratórios!",
      });
    }
  },
};
// Função auxiliar para verificar se o campo obrigatório está presente
function verificarCampoObrigatorio(valor, campo) {
  if (!valor || valor == undefined || valor == null || valor == "") {
    return {
      status: 400,
      error: `O campo '${campo}' deve ser obrigatório.`,
    };
  }
}
