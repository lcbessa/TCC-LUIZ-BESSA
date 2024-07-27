import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarLaboratorio(novoLaboratorio) {
    try {
      const laboratorioCriado = await prisma.laboratorio.create({
        data: novoLaboratorio,
      });
      return {
        status: 201,
        sucess: laboratorioCriado,
      };
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível criar um laboratório!",
      };
    }
  },
  async listarLaboratorios(ordemCrescente) {
    try {
      const laboratorios = await prisma.laboratorio.findMany(ordemCrescente);
      return {
        status: 200,
        sucess: laboratorios,
      };
    } catch (error) {
      console.error("Erro ao listar laboratórios", error);
      return {
        status: 500,
        error: "Não foi possível listar os laboratórios!",
      };
    }
  },
  async obterLaboratorioPorId(id) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: parseInt(id) },
        include: { reservas: true },
      });
      if (!laboratorio) {
        return {
          status: 404,
          error: "Laboratório não encontrado!",
        };
      }
      return {
        status: 200,
        sucess: laboratorio,
      };
    } catch (error) {
      console.error("Erro ao buscar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível buscar laboratório!",
      };
    }
  },
  async obterLaboratorioPorCampo(campo, nomeCampo) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { [campo]: nomeCampo },
      });
      if (!laboratorio) {
        return {
          status: 404,
          error: "Laboratório não encontrado!",
        };
      }
      return {
        status: 200,
        sucess: laboratorio,
      };
    } catch (error) {
      console.error(`Erro ao buscar laboratório por ${campo}`, error);
      return {
        status: 500,
        error: `Não foi possível buscar laboratório por ${campo}!`,
      };
    }
  },
};
