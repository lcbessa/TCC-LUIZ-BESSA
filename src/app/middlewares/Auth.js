import jwt from "jsonwebtoken";
import Autenticacao from "../../config/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função para enviar respostas de erro
const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

// Middleware de autenticação
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendErrorResponse(res, 401, "Usuário não autenticado");
  }

  try {
    const payload = jwt.verify(token, Autenticacao.secret);
    req.usuarioId = payload.userId;
    req.isAdmin = payload.isAdmin;
    next();
  } catch (err) {
    return sendErrorResponse(res, 403, "Token inválido ou expirado");
  }
};

// Middleware de autorização para administrador
export const authorizeAdmin = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
    });

    if (!usuario || !usuario.admin) {
      return sendErrorResponse(
        res,
        403,
        "Acesso não autorizado - Apenas administradores!"
      );
    }

    next();
  } catch (err) {
    return sendErrorResponse(res, 500, "Erro no servidor");
  }
};
