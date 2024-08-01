import { Router } from "express";
import UsuarioController from "./app/controllers/UsuarioController";
import ReservaController from "./app/controllers/ReservaController";
import { authenticateToken, authorizeAdmin } from "./app/middlewares/Auth";
import LaboratorioController from "./app/controllers/LaboratorioController";
import UsuarioController from "./app/controllers/UsuarioController";

const routes = Router();

/**
 * Rotas para Usuários
 */
routes.post("/registrar", UsuarioController.criarUsuario);
routes.post("/login", UsuarioController.Login);

// Fins de teste
routes.get(
  "/usuarios",
  authenticateToken,
  authorizeAdmin,
  UsuarioController.ListarUsuarios
);

/**
 * Rotas para Laboratórios
 */

// Somente pessoas autenticadas e administradores podem criar laboratórios
routes.post(
  "/laboratorios",
  authenticateToken,
  authorizeAdmin,
  LaboratorioController.criarLaboratorio
);
// Somente pessoas autenticadas podem listar laboratórios
routes.get(
  "/laboratorios",
  authenticateToken,
  LaboratorioController.listarLaboratorios
);

// Somente pessoas autenticadas podem listar um laboratório
routes.get(
  "/laboratorio/:id",
  authenticateToken,
  LaboratorioController.listarUmLaboratorio
);

// Somente pessoas autenticadas e administradores podem atualizar laboratórios
routes.put(
  "/laboratorio/:id",
  authenticateToken,
  authorizeAdmin,
  LaboratorioController.atualizarLaboratorio
);

// Somente pessoas autenticadas e administradores podem deletar laboratórios
routes.delete(
  "/laboratorio/:id",
  authenticateToken,
  authorizeAdmin,
  LaboratorioController.deletarLaboratorio
);

/**
 * Rotas para Reservas
 */
// Somente pessoas autenticadas podem criar reservas
routes.post("/reservas", authenticateToken, ReservaController.criarReserva);

// Somente pessoas autenticadas podem listar reservas
routes.get("/reservas", authenticateToken, ReservaController.listarReservas);

// // Somente pessoas autenticadas podem listar uma reserva
routes.get(
  "/reserva/:id",
  authenticateToken,
  ReservaController.listarUmaReserva
);

// // Somente pessoas autenticadas podem atualizar reservas
routes.put(
  "/reserva/:id",
  authenticateToken,
  ReservaController.atualizarReserva
);

// // Somente pessoas autenticadas podem deletar reservas
routes.delete(
  "/reserva/:id",
  authenticateToken,
  ReservaController.deletarReserva
);
export { routes };
