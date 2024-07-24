import LaboratorioPersistence from "../persistence/LaboratorioPersistence";

export default {
  async criarLaboratorio(newLab) {
    try {
      let resposta = null;
      resposta = await this.getLaboratorioByName(newLab.nome);

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesmo nome já existe.",
        };
      }

      resposta = await this.getLaboratorioBySigla(newLab.sigla);

      if (resposta.sucess) {
        return {
          status: 400,
          error: "Laboratório com mesma sigla já existe.",
        };
      }
      return await LaboratorioPersistence.criarLaboratorio(newLab);
    } catch (error) {
      console.error("Erro ao criar laboratório", error);
      return {
        status: 500,
        error: "Não foi possível criar um laboratório!",
      };
    }
  },

  // async listarLaboratorios(request, response) {
  //   try {
  //     // Lista todos os laboratórios em ordem alfabética
  //     const laboratorios = await prisma.laboratorio.findMany({
  //       orderBy: {
  //         nome: "asc",
  //       },
  //       include: { reservas: true },
  //     });
  //     return response.status(200).json(laboratorios);
  //   } catch (error) {
  //     console.error("Erro ao listar laboratórios", error);
  //     return response
  //       .status(500)
  //       .send({ error: "Não foi possível listar laboratórios!" });
  //   }
  // },
  // async listarUmLaboratorio(request, response) {
  //   try {
  //     // ID do laboratório a ser listado deve ser um número válido
  //     const { id } = request.params;
  //     if (isNaN(id)) {
  //       return response
  //         .status(400)
  //         .send({ error: "ID inválido: o ID deve ser um número válido." });
  //     }

  //     // Procura o laboratório pelo ID único
  //     const laboratorio = await prisma.laboratorio.findUnique({
  //       where: { id: Number(id) },
  //       include: { reservas: true },
  //     });

  //     // Verifica se o laboratório existe
  //     if (!laboratorio) {
  //       return response
  //         .status(404)
  //         .send({ error: "Laboratório não encontrado." });
  //     }
  //     return response.status(200).json(laboratorio);
  //   } catch (error) {
  //     console.error("Erro ao listar laboratório", error);
  //     return response
  //       .status(500)
  //       .send({ error: "Não foi possível listar laboratório!" });
  //   }
  // },
  // async atualizarLaboratorio(request, response) {
  //   try {
  //     const { id } = request.params;
  //     const { nome, sigla } = request.body;

  //     // ID do laboratório a ser atualizado deve ser um número válido
  //     if (isNaN(id)) {
  //       return response
  //         .status(400)
  //         .send({ error: "ID inválido: o ID deve ser um número válido." });
  //     }

  //     // Procura o laboratório a ser atualizado pelo ID único
  //     let laboratorio = await prisma.laboratorio.findUnique({
  //       where: { id: Number(id) },
  //     });

  //     // Verifica se o laboratório existe
  //     if (!laboratorio.ativo) {
  //       return response
  //         .status(404)
  //         .send({ error: "Laboratório não encontrado ou inativo." });
  //     }
  //     // Nome de Laboratório deve ser obrigatório
  //     if (!nome) {
  //       return response
  //         .status(400)
  //         .send({ error: "O campo 'nome' deve ser obrigatório." });
  //     }

  //     // Verifica se o novo nome já está em uso por outro laboratório
  //     const laboratorioComNome = await prisma.laboratorio.findFirst({
  //       where: { nome, NOT: { id: Number(id) } },
  //     });

  //     // Nome de Laboratório deve ser único
  //     if (laboratorioComNome) {
  //       return response
  //         .status(400)
  //         .send({ error: "Laboratório com mesmo nome já existe!" });
  //     }

  //     // Sigla de Laboratório deve ser obrigatória
  //     if (!sigla) {
  //       return response
  //         .status(400)
  //         .send({ error: "O campo 'sigla' deve ser obrigatório." });
  //     }

  //     // Verifica se a nova sigla já está em uso por outro laboratório
  //     const laboratorioComSigla = await prisma.laboratorio.findFirst({
  //       where: { sigla, NOT: { id: Number(id) } },
  //     });

  //     // Sigla deve ser única
  //     if (laboratorioComSigla) {
  //       return response
  //         .status(400)
  //         .send({ error: "Laboratório com mesma sigla já existe!" });
  //     }

  //     laboratorio = await prisma.laboratorio.update({
  //       where: { id: Number(id) },
  //       data: {
  //         nome: nome,
  //         sigla: sigla,
  //       },
  //     });
  //     return response.status(200).json(laboratorio);
  //   } catch (error) {
  //     console.error("Erro ao atualizar laboratório", error);
  //     return response
  //       .status(500)
  //       .send({ error: "Não foi possível atualizar laboratório!" });
  //   }
  // },
  // async deletarLaboratorio(request, response) {
  //   try {
  //     const { id } = request.params;

  //     if (isNaN(id)) {
  //       return response
  //         .status(400)
  //         .send({ error: "ID inválido: o ID deve ser um número válido." });
  //     }

  //     // Procura o laboratório a ser excluido pelo ID
  //     const laboratorio = await prisma.laboratorio.findUnique({
  //       where: { id: Number(id) },
  //       include: { reservas: true },
  //     });

  //     // Verifica se o laboratório existe
  //     if (!laboratorio) {
  //       return response
  //         .status(404)
  //         .send({ error: "Laboratório não encontrado." });
  //     }

  //     if (!laboratorio.reservas.length) {
  //       // Exclui o laboratório  fisicamente do banco de dados se nunca teve reservas
  //       await prisma.laboratorio.delete({
  //         where: { id: Number(id) },
  //       });
  //       return response
  //         .status(200)
  //         .send({ message: "Laboratório excluído com sucesso." });
  //     } else {
  //       const dataAtual = new Date();
  //       dataAtual.setHours(dataAtual.getHours() - 3); // Ajusta o fuso horário para o horário de Brasília
  //       console.log(dataAtual);
  //       const reservasFuturas = laboratorio.reservas.filter(
  //         (reserva) => reserva.dataHoraFim >= dataAtual
  //       );
  //       console.log(reservasFuturas);
  //       // Se o laboratório não tem reservas futuras ou em andamento, ele pode ser desativado
  //       if (reservasFuturas.length === 0) {
  //         await prisma.laboratorio.update({
  //           where: { id: Number(id) },
  //           data: {
  //             ativo: false,
  //           },
  //         });
  //         return response
  //           .status(200)
  //           .send({ message: "Laboratório desativado com sucesso." });
  //       } else {
  //         // Se o laboratório tem reservas futuras ou em andamento, ele não pode ser desativado
  //         return response.status(400).send({
  //           error:
  //             "Laboratório não pode ser desativado pois tem reservas futuras ou em andamento.",
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Erro ao excluir laboratório", error);
  //     return response
  //       .status(500)
  //       .send({ error: "Erro interno ao excluir laboratório." });
  //   }
  // },
  async getLaboratorioByName(nome) {
    const resposta = await LaboratorioPersistence.getLaboratorioByName(nome);
    return resposta;
  },
  async getLaboratorioBySigla(sigla) {
    const resposta = await LaboratorioPersistence.getLaboratorioBySigla(sigla);
    return resposta;
  },
};
