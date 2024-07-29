import LaboratorioBusiness from "../business/LaboratorioBusiness";
import { validarId, verificarCampoObrigatorio } from "../../utils/validacoes";

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
  async listarUmLaboratorio(request, response) {
    try {
      const { id } = request.params;
      let resposta = null;
      resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await LaboratorioBusiness.listarUmLaboratorio(id);
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar laboratório", error);
      return response.status(500).json({
        status: 500,
        error: "Não foi possível listar o laboratório!",
      });
    }
  },
  async atualizarLaboratorio(request, response) {
    try {
      const { id } = request.params;
      const { nome, sigla } = request.body;
      let resposta = null;
      resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(nome, "nome");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = verificarCampoObrigatorio(sigla, "sigla");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await LaboratorioBusiness.atualizarLaboratorio(id, {
        nome,
        sigla,
      });
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao atualizar laboratório", error);
      return response.status(500).json({
        status: 500,
        error: "Não foi possível atualizar o laboratório!",
      });
    }
  },
  async deletarLaboratorio(request, response) {
    try {
      const { id } = request.params;
      let resposta = null;
      resposta = validarId(id);
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await LaboratorioBusiness.deletarLaboratorio(id);
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao deletar laboratório", error);
      return response.status(500).json({
        status: 500,
        error: "Não foi possível deletar o laboratório!",
      });
    }
  },
};
