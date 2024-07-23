import { PrismaClient } from "@prisma/client";
import { tr } from "date-fns/locale";

const prisma = new PrismaClient();

const verificarCampoObrigatorio = (campo, nomeCampo, response) => {
  if (!campo) {
    response
      .status(400)
      .send({ error: `O campo '${nomeCampo}' deve ser obrigatório.` });
    return false;
  }
  return true;
};

const verificarNomeUnico = async (nome, id, response) => {
  const filtro = id ? { nome, NOT: { id: Number(id) } } : { nome };

  const laboratorio = await prisma.laboratorio.findFirst({
    where: filtro,
  });

  if (laboratorio) {
    response
      .status(400)
      .send({ error: "Laboratório com mesmo nome já existe!" });
    return false;
  }
  return true;
};

const verificarSiglaUnica = async (sigla, id, response) => {
  const filtro = id ? { sigla, NOT: { id: Number(id) } } : { sigla };

  const laboratorio = await prisma.laboratorio.findFirst({
    where: filtro,
  });

  if (laboratorio) {
    response
      .status(400)
      .send({ error: "Laboratório com mesma sigla já existe!" });
    return false;
  }
  return true;
};

const verificarIdValido = (id, response) => {
  if (isNaN(id)) {
    response
      .status(400)
      .send({ error: "ID inválido: o ID deve ser um número válido." });
    return false;
  }
  return true;
};

const obterLaboratorioPorId = async (id, response) => {
  return await prisma.laboratorio.findUnique({
    where: { id: Number(id) },
    include: { reservas: true },
  });
};

export default {
  async criarLaboratorio(request, response) {
    try {
      const { nome, sigla } = request.body;

      // Verificar campos obrigatórios e unicidade
      if (
        !verificarCampoObrigatorio(nome, "nome", response) ||
        !verificarCampoObrigatorio(sigla, "sigla", response)
      ) {
        return;
      }
      if (
        !(await verificarNomeUnico(nome, null, response)) ||
        !(await verificarSiglaUnica(sigla, null, response))
      ) {
        return;
      }

      // Criar laboratório
      const laboratorioCriado = await prisma.laboratorio.create({
        data: { nome, sigla },
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
        orderBy: { nome: "asc" },
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

      if (!verificarIdValido(id, response)) {
        return;
      }

      const laboratorio = await obterLaboratorioPorId(id, response);
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

      if (!verificarIdValido(id, response)) {
        return;
      }

      let laboratorio = await obterLaboratorioPorId(id, response);
      if (!laboratorio || !laboratorio.ativo) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado ou inativo." });
      }

      // Verificar campos obrigatórios e unicidade
      if (
        !verificarCampoObrigatorio(nome, "nome", response) ||
        !verificarCampoObrigatorio(sigla, "sigla", response)
      ) {
        return;
      }
      if (
        !(await verificarNomeUnico(nome, Number(id), response)) ||
        !(await verificarSiglaUnica(sigla, Number(id), response))
      ) {
        return;
      }

      laboratorio = await prisma.laboratorio.update({
        where: { id: Number(id) },
        data: { nome, sigla },
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

      if (!verificarIdValido(id, response)) {
        return;
      }

      const laboratorio = await obterLaboratorioPorId(id, response);
      if (!laboratorio) {
        return response
          .status(404)
          .send({ error: "Laboratório não encontrado." });
      }
      // Excluir o laboratório fisicamente do banco de dados se nunca teve reservas
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
        const reservasFuturas = laboratorio.reservas.filter(
          (reserva) => reserva.dataHoraFim >= dataAtual
        );
        // Se o laboratório não tem reservas futuras ou em andamento, ele pode ser desativado
        if (reservasFuturas.length === 0) {
          await prisma.laboratorio.update({
            where: { id: Number(id) },
            data: { ativo: false },
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
