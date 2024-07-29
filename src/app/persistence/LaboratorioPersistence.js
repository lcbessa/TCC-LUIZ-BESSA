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
  async atualizarLaboratorio(id, laboratorioASerAtualizado) {
    try {
      const laboratorioAtualizado = await prisma.laboratorio.update({
        where: { id: parseInt(id) },
        data: {
          nome: laboratorioASerAtualizado.nome,
          sigla: laboratorioASerAtualizado.sigla,
        },
      });

      return {
        status: 200,
        sucess: laboratorioAtualizado,
      };
    } catch (error) {
      console.error("Erro ao atualizar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível atualizar o laboratório!",
      };
    }
  },
  async deletarLaboratorio(id) {
    try {
      await prisma.laboratorio.delete({
        where: { id: parseInt(id) },
      });
      return {
        status: 200,
        sucess: "Laboratório deletado com sucesso!",
      };
    } catch (error) {
      console.error("Erro ao deletar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível deletar o laboratório!",
      };
    }
  },
  async desativarLaboratorio(id) {
    try {
      const laboratorioDesativado = await prisma.laboratorio.update({
        where: { id: parseInt(id) },
        data: { ativo: false },
      });
      return {
        status: 200,
        sucess: laboratorioDesativado,
      };
    } catch (error) {
      console.error("Erro ao desativar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível desativar o laboratório!",
      };
    }
  },
  // funções auxiliares
  async obterLaboratorioPorId(id) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: parseInt(id) },
        include: { reservas: true },
      });
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
  async obterLaboratorioPorCampo(id, campo, nomeCampo) {
    try {
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { [campo]: nomeCampo, NOT: { id: Number(id) } },
      });
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
