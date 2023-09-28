import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  async criarLaboratorio(request, response) {
    try {
      const { nome, sigla } = request.body;

      // [RN001] Verifica se o campo "nome" não é nulo
      if (!nome) {
        return response
          .status(400)
          .send({ error: "O campo 'nome' não pode ser nulo." });
      }

      // [RN002] Nome de Laboratório deve ser único
      // Verifica se o nome já está em uso por outro laboratório
      const laboratorioComNome = await prisma.laboratorio.findFirst({
        where: { nome },
      });

      if (laboratorioComNome) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesmo nome já existe!" });
      }

      // [RN003] Sigla de Laboratório não pode ser nula
      if (!sigla) {
        return response
          .status(400)
          .send({ error: "O campo 'sigla' não pode ser nulo." });
      }

      // [RN004] Sigla deve ser única
      // Verifica se a sigla já está em uso por outro laboratório
      const laboratorioComSigla = await prisma.laboratorio.findFirst({
        where: { sigla },
      });

      if (laboratorioComSigla) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesma sigla já existe!" });
      }

      const laboratorioCriado = await prisma.laboratorio.create({
        data: {
          nome,
          sigla,
        },
      });
      return response.status(201).json(laboratorioCriado);
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return response
        .status(500)
        .send({ error: "Não foi possível criar um laboratório!" });
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

      // Procura o laboratório pelo ID
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });

      // Verifica se o laboratório existe
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
  async atualizarLaboratorio(request, response) {
    try {
      const { id } = request.params;
      const { nome, sigla } = request.body;

      if (isNaN(id)) {
        return response
          .status(400)
          .send({ error: "ID inválido: o ID deve ser um número válido." });
      }

      // Procura o laboratório a ser atualizado pelo ID
      let laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });

      // Verifica se o laboratório existe
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }
      // [RN001] Nome de Laboratório não pode ser nulo
      if (!nome) {
        return response
          .status(400)
          .send({ error: "O campo 'nome' não pode ser nulo." });
      }

      // [RN002] Nome de Laboratório deve ser único
      // Verifica se o novo nome já está em uso por outro laboratório
      const laboratorioComNome = await prisma.laboratorio.findFirst({
        where: { nome, NOT: { id: Number(id) } },
      });

      if (laboratorioComNome) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesmo nome já existe!" });
      }

      // [RN003] Sigla de Laboratório não pode ser nula
      if (!sigla) {
        return response
          .status(400)
          .send({ error: "O campo 'sigla' não pode ser nulo." });
      }

      // [RN004] Sigla deve ser única
      // Verifica se a nova sigla já está em uso por outro laboratório
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

      // Procura o laboratório a ser excluido pelo ID
      const laboratorio = await prisma.laboratorio.findUnique({
        where: { id: Number(id) },
      });

      // Verifica se o laboratório existe
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }

      // [RN005] Restrição de Exclusão de Laboratório com Reservas
      // Verifica se o laboratório a ser excluido possui reservas
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
