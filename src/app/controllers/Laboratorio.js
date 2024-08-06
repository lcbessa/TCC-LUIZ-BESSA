import { PrismaClient } from "@prisma/client";
import { tr } from "date-fns/locale";

const prisma = new PrismaClient();

export default {
  async criarLaboratorio(request, response) {
    try {
      const { nome, sigla } = request.body;

      if (!nome) {
        return response
          .status(400)
          .send({ error: "O campo 'nome' deve ser obrigatório." });
      }
      const laboratorioComNome = await prisma.laboratorio.findFirst({
        where: { nome },
      });

      if (laboratorioComNome) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesmo nome já existe!" });
      }

      if (!sigla) {
        return response
          .status(400)
          .send({ error: "O campo 'sigla' deve ser obrigatório." });
      }

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
      const laboratorios = await prisma.laboratorio.findMany({
        orderBy: {
          nome: "asc",
        },
        include: { reservas: true },
      });
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
        include: { reservas: true },
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

      if (!laboratorio.ativo) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado ou inativo." });
      }

      if (!nome) {
        return response
          .status(400)
          .send({ error: "O campo 'nome' deve ser obrigatório." });
      }

      const laboratorioComNome = await prisma.laboratorio.findFirst({
        where: { nome, NOT: { id: Number(id) } },
      });

      if (laboratorioComNome) {
        return response
          .status(400)
          .send({ error: "Laboratório com mesmo nome já existe!" });
      }

      if (!sigla) {
        return response
          .status(400)
          .send({ error: "O campo 'sigla' deve ser obrigatório." });
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
        include: { reservas: true },
      });

      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }

      if (!laboratorio.reservas.length) {
        await prisma.laboratorio.delete({
          where: { id: Number(id) },
        });
        return response
          .status(200)
          .send({ message: "Laboratório excluído com sucesso." });
      } else {
        const dataAtual = new Date();
        dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília
        console.log(dataAtual);
        const reservasFuturas = laboratorio.reservas.filter(
          (reserva) => reserva.dataHoraFim >= dataAtual
        );
        console.log(reservasFuturas);
        if (reservasFuturas.length === 0) {
          await prisma.laboratorio.update({
            where: { id: Number(id) },
            data: {
              ativo: false,
            },
          });
          return response
            .status(200)
            .send({ message: "Laboratório desativado com sucesso." });
        } else {
          return response.status(400).send({
            error:
              "Laboratório não pode ser desativado pois tem reservas futuras ou em andamento.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao excluir laboratório", error);
      return response
        .status(500)
        .send({ error: "Erro interno ao excluir laboratório." });
    }
  },
};
