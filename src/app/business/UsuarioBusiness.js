import { gerarToken } from "../../utils/validacoes";
import UsuarioPersistence from "../persistence/UsuarioPersistence";

export default {
  async criarUsuario(usuario) {
    try {
      // Verificar se o email é único
      const emailUnico = await this.validarEmailUnico(usuario.email);
      if (emailUnico) return emailUnico;

      return await UsuarioPersistence.criarUsuario(usuario);
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      return {
        status: 500,
        error: "Não foi possível criar um usuário!",
      };
    }
  },
  async loginUsuario(usuario) {
    let usuarioBuscado = await UsuarioPersistence.buscarUsuarioPorEmail(
      usuario.email
    );
    if (!usuarioBuscado.sucess) {
      return {
        status: 404,
        error: "Email não registrado.",
      };
    }
    if (usuarioBuscado.sucess.senha !== usuario.senha) {
      return {
        status: 401,
        error: "Senha incorreta.",
      };
    }
    const token = gerarToken(
      usuarioBuscado.sucess.id,
      usuarioBuscado.sucess.admin
    );
    return {
      status: 200,
      sucess: { message: "Autenticado com sucesso!", token },
    };
  },
  async listarUsuarios() {
    try {
      return await UsuarioPersistence.listarUsuarios();
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return {
        status: 500,
        error: "Não foi possível listar os usuários!",
      };
    }
  },
  // Métodos auxiliares
  async validarEmailUnico(email) {
    const emailProcurado = await UsuarioPersistence.buscarUsuarioPorEmail(
      email
    );
    if (emailProcurado.sucess) {
      return {
        status: 400,
        error: "O email já está sendo utilizado.",
      };
    }
    return null;
  },
};
