import { Router } from "express";
import Laboratorio from "./controllers/Laboratorio";
import Reserva from "./controllers/Reserva";
const routes = Router();
/**
 * Rotas para Laboratórios
 */
routes.post("/laboratorios", Laboratorio.criarLaboratorio);
routes.get("/laboratorios", Laboratorio.listarLaboratorios);
routes.get("/laboratorio/:id", Laboratorio.listarUmLaboratorio);
routes.put("/laboratorio/:id", Laboratorio.atualizarLaboratorio);
routes.delete("/laboratorio/:id", Laboratorio.deletarLaboratorio);

/**
 * Rotas para Reservas
 */
routes.post("/reservas", Reserva.criarReserva);
routes.get("/reservas", Reserva.listarReservas);
routes.get("/reserva/:id", Reserva.listarUmaReserva);
routes.put("/reserva/:id", Reserva.atualizarReserva);
routes.delete("/reserva/:id", Reserva.deletarReserva);
export { routes };
