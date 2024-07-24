import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarLaboratorio(newLab) {
    try {
      const laboratorioCriado = await prisma.laboratorio.create({
        data: newLab,
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
  async getLaboratorioByName(nome) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { nome },
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
      console.error("Erro ao buscar laboratório por nome", error);
      return {
        status: 500,
        error: "Não foi possível buscar laboratório por nome!",
      };
    }
  },
  async getLaboratorioBySigla(sigla) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { sigla },
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
      console.error("Erro ao buscar laboratório por sigla", error);
      return {
        status: 500,
        error: "Não foi possível buscar laboratório por sigla!",
      };
    }
  },
};
