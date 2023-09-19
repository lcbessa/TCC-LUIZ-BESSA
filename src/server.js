import express from "express";
import { routes } from "./routes";

const app = express();
const port = 3000;

app.use(express.json()); // padronização de troca de dados
app.use(express.urlencoded({ extended: false })); //  segurança

app.use(routes);
console.log(`Servidor rodando no link http://localhost:${port}`);
app.listen(port); // abrir o servidor
