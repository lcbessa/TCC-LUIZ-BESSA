import jwt from "jsonwebtoken";
import Autenticacao from "../config/auth";

export function verificarCampoObrigatorio(valor, campo) {
  if (!valor || valor == undefined || valor == null || valor == "") {
    return {
      status: 400,
      error: `O campo '${campo}' deve ser obrigatório.`,
    };
  }
}
export function validarId(id) {
  if (isNaN(id)) {
    return {
      status: 400,
      error: "O id deve ser um número.",
    };
  }
}

export const gerarToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, Autenticacao.secret, {
    expiresIn: "1d",
  });
};
