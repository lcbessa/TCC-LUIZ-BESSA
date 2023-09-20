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
  async listarLaboratorios(request, response) {
    try {
      const laboratorios = await prisma.laboratorio.findMany();
      return response.status(200).json(laboratorios);
    } catch (error) {
      console.error("Erro ao listar laboratórios", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar laboratórios!" });
    }
  },
  async listarUmLaboratorio(request, response) {
    try {
      const { id } = request.params;
      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }
      return response.status(200).json(laboratorio);
    } catch (error) {
      console.error("Erro ao listar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível listar laboratório!" });
    }
  },
  async getLaboratorioByName(nome) {
    try {
      const laboratorio = await prisma.laboratorio.findFirst({
        where: { nome },
      });
      if (!laboratorio) {
        return {
          status: 404,
          error: "Nome não encontrado.",
        };
      }
      return {
        status: 200,
        sucess: laboratorio,
      };
    } catch (error) {
      console.error("Erro ao listar laboratório pelo nome!", error);
      return {
        status: 500,
        error: "Não foi possível listar laboratório pelo nome!",
      };
    }
  },
  async getLaboratorioBySigla(sigla) {
    try {
      const laboratorio = await prisma.laboratorio.findFirst({
        where: { sigla },
      });
      if (!laboratorio) {
        return {
          status: 404,
          error: "Sigla não encontrado.",
        };
      }
      return {
        status: 200,
        sucess: laboratorio,
      };
    } catch (error) {
      console.error("Erro ao listar laboratório pela sigla", error);
      return {
        status: 500,
        error: "Não foi possível listar laboratório pela sigla!",
      };
    }
  },

  async atualizarLaboratorio(request, response) {
    try {
      const { id } = request.params;
      const { nome, sigla } = request.body;
      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }
      let laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }

      const laboratorioComNome = await prisma.laboratorio.findFirst({
        where: { nome, NOT: { id: Number(id) } },
      });

      if (laboratorioComNome) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesmo nome já existe!" });
      }

      const laboratorioComSigla = await prisma.laboratorio.findFirst({
        where: { sigla, NOT: { id: Number(id) } },
      });

      if (laboratorioComSigla) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesma sigla já existe!" });
      }

      laboratorio = await prisma.laboratorio.update({
        where: { id: Number(id) },
        data: {
          nome: nome,
          sigla: sigla,
        },
      });
      return response.status(200).json(laboratorio);
    } catch (error) {
      console.error("Erro ao atualizar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível atualizar laboratório!" });
    }
  },
  async deletarLaboratorio(request, response) {
    try {
      const { id } = request.params;

      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }

      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });

      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }
      const reservasDoLaboratorio = await prisma.reserva.findMany({
        where: { laboratorioId: Number(id) },
      });

      if (reservasDoLaboratorio.length > 0) {
        return response.status(400).send({
          error: "Laboratório possui reservas e não pode ser excluído!",
        });
      }
      await prisma.laboratorio.delete({
        where: { id: Number(id) },
      });

      return response
        .status(200)
        .send({ message: "Laboratório excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir laboratório", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao excluir laboratório." });
    }
  },
};
