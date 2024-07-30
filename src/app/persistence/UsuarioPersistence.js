import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarUsuario(usuario) {
    try {
      const usuarioCriado = await prisma.usuario.create({
        data: {
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
        },
      });

      return {
        status: 201,
        sucess: usuarioCriado,
      };
    } catch (error) {
      console.error("Erro ao criar usuário", error);
      return {
        status: 500,
        error: "Não foi possível criar um usuário!",
      };
    }
  },
  async listarUsuarios() {
    try {
      const usuarios = await prisma.usuario.findMany();
      const usuariosComReserva = await Promise.all(
        usuarios.map(async (usuario) => {
          const reservas = await prisma.reserva.findMany({
            where: { usuarioId: usuario.id },
          });
          return { ...usuario, reservas };
        })
      );

      return {
        status: 200,
        sucess: usuariosComReserva,
      };
    } catch (error) {
      console.error("Erro ao listar usuários", error);
      return {
        status: 500,
        error: "Não foi possível listar os usuários!",
      };
    }
  },
  async buscarUsuarioPorEmail(email) {
    try {
      const emailRegistrado = await prisma.usuario.findUnique({
        where: { email },
      });

      return {
        status: 200,
        sucess: emailRegistrado,
      };
    } catch (error) {
      console.error("Erro ao buscar usuário por email", error);
      return {
        status: 500,
        error: "Não foi possível buscar o usuário!",
      };
    }
  },
};
