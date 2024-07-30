import UsuarioBusiness from "../business/UsuarioBusiness";
import { verificarCampoObrigatorio } from "../../utils/validacoes";

export default {
  async criarUsuario(request, response) {
    try {
      const { nome, email, senha } = request.body;

      let resposta = null;

      resposta = verificarCampoObrigatorio(nome, "nome");
      // Verificar se o campo "nome" não é nulo
      if (resposta) return response.status(resposta.status).json(resposta);

      // Verificar se o campo "email" não é nulo
      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);

      // Verificar se o campo "senha" não é nulo
      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await UsuarioBusiness.criarUsuario({
        nome,
        email,
        senha,
      });

      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar um usuário!" });
    }
  },
  async Login(request, response) {
    try {
      const { email, senha } = request.body;

      let resposta = null;

      // Verificar se o campo "email" não é nulo
      resposta = verificarCampoObrigatorio(email, "email");
      if (resposta) return response.status(resposta.status).json(resposta);

      // Verificar se o campo "senha" não é nulo
      resposta = verificarCampoObrigatorio(senha, "senha");
      if (resposta) return response.status(resposta.status).json(resposta);

      resposta = await UsuarioBusiness.loginUsuario({ email, senha });

      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao autenticar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível autenticar o usuário!" });
    }
  },
  async ListarUsuarios(request, response) {
    try {
      const resposta = await UsuarioBusiness.listarUsuarios();
      return response.status(resposta.status).json(resposta);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar os usuários!" });
    }
  },
};
