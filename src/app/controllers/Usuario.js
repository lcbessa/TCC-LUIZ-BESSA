import jwt from "jsonwebtoken";
import Autenticacao from "../../config/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const gerarToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, Autenticacao.secret, {
    expiresIn: "1d",
  });
};

const verificarCampoObrigatorio = (campo, nomeCampo, response) => {
  if (!campo) {
    response.status(400).send({ error: `${nomeCampo} é obrigatório!` });
    return false; // Indica que a validação falhou
  }
  return true; // Validação bem-sucedida
};

const verificarCampoUnico = async (campo, valor, nomeCampo, response) => {
  const usuario = await prisma.usuario.findUnique({
    where: { [campo]: valor },
  });
  if (usuario) {
    response.status(400).send({ error: `${nomeCampo} já está em uso!` });
    return false; // Indica que a validação falhou
  }
  return true; // Validação bem-sucedida
};

export default {
  async criarUsuario(request, response) {
    try {
      const { nome, email, senha } = request.body;

      // Verificar se os campos são obrigatórios
      if (
        !verificarCampoObrigatorio(nome, "nome", response) ||
        !verificarCampoObrigatorio(email, "email", response) ||
        !verificarCampoObrigatorio(senha, "senha", response)
      ) {
        return; // Retorna se qualquer validação falhar
      }

      // Verificar se o email já está em uso por outro usuário
      if (!(await verificarCampoUnico("email", email, "Email", response))) {
        return; // Retorna se a validação falhar
      }

      // Criar novo usuário
      const usuarioCriado = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha,
        },
      });
      return response.status(201).json(usuarioCriado);
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
      // Verificar os campos obrigatórios
      if (
        !verificarCampoObrigatorio(email, "email", response) ||
        !verificarCampoObrigatorio(senha, "senha", response)
      ) {
        return;
      }

      // Verificar se o email não está registrado
      const usuario = await prisma.usuario.findUnique({
        where: { email },
      });
      if (!usuario) {
        return response.status(400).send({ error: "Email não registrado!" });
      }

      // Verificar se a senha está correta
      if (senha !== usuario.senha) {
        return response.status(400).json({ error: "Senha incorreta!" });
      }
      // Gerar token JWT
      const token = gerarToken(usuario.id, usuario.admin);
      response.status(200).json({ message: "Autenticado com sucesso", token });
    } catch (error) {
      console.error("Erro ao autenticar usuário", error);
      return response
        .status(500)
        .send({ error: "Não foi possível autenticar o usuário!" });
    }
  },
  async ListarUsuarios(request, response) {
    try {
      const usuarios = await prisma.usuario.findMany();
      const usuariosComReservas = await Promise.all(
        usuarios.map(async (usuario) => {
          const reservas = await prisma.reserva.findMany({
            where: {
              usuarioId: usuario.id,
            },
          });
          return {
            ...usuario,
            reservas,
          };
        })
      );

      return response.status(200).json(usuariosComReservas);
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar os usuários!" });
    }
  },
};
