import { Router } from "express";
import Usuario from "./app/controllers/UsuarioController";
import Laboratorio from "./app/controllers/LaboratorioController";
import Reserva from "./app/controllers/ReservaController";
import { authenticateToken, authorizeAdmin } from "./app/middlewares/Auth";
import LaboratorioController from "./app/controllers/LaboratorioController";

const routes = Router();

/**
 * Rotas para Usuários
 */
// routes.post("/registrar", Usuario.criarUsuario);
// routes.post("/login", Usuario.Login);

// Fins de teste
// routes.get(
//   "/usuarios",
//   // authenticateToken,
//   // authorizeAdmin,
//   Usuario.ListarUsuarios
// );

/**
 * Rotas para Laboratórios
 */

// Somente pessoas autenticadas e administradores podem criar laboratórios
routes.post(
  "/laboratorios",
  // authenticateToken,
  // authorizeAdmin,
  LaboratorioController.criarLaboratorio
);
// Somente pessoas autenticadas podem listar laboratórios
// routes.get("/laboratorios",
//   // authenticateToken,
//   Laboratorio.listarLaboratorios);

// Somente pessoas autenticadas podem listar um laboratório
// routes.get(
//   "/laboratorio/:id",
//   // authenticateToken,
//   Laboratorio.listarUmLaboratorio
// );

// Somente pessoas autenticadas e administradores podem atualizar laboratórios
// routes.put(
//   "/laboratorio/:id",
//   // authenticateToken,
//   // authorizeAdmin,
//   Laboratorio.atualizarLaboratorio
// );

// Somente pessoas autenticadas e administradores podem deletar laboratórios
// routes.delete(
//   "/laboratorio/:id",
//   // authenticateToken,
//   // authorizeAdmin,
//   Laboratorio.deletarLaboratorio
// );

/**
 * Rotas para Reservas
 */
// Somente pessoas autenticadas podem criar reservas
// routes.post(
//   "/reservas",
//   // authenticateToken,
//   Reserva.criarReserva
// );

// Somente pessoas autenticadas podem listar reservas
// routes.get(
//   "/reservas",
//   // authenticateToken,
//   Reserva.listarReservas
// );

// Somente pessoas autenticadas podem listar uma reserva
// routes.get(
//   "/reserva/:id",
//   // authenticateToken,
//   Reserva.listarUmaReserva
// );

// Somente pessoas autenticadas podem atualizar reservas
// routes.put(
//   "/reserva/:id",
//   // authenticateToken,
//   Reserva.atualizarReserva
// );

// Somente pessoas autenticadas podem deletar reservas
// routes.delete(
//   "/reserva/:id",
//   // authenticateToken,
//   Reserva.deletarReserva
// );
export { routes };
