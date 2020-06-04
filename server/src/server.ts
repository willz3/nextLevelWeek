import express from 'express';
import routes from './routes'
import cors from 'cors';
import path from 'path';

const app = express();
//Dizendo para o express que o retorno das requisições serão feitas em JSON e o padrão será REST
app.use(cors());
app.use(express.json());
app.use(routes);

//Rota: Endereço completo da request
//Recurso: Qual entidade estamos acessando. Nesse caso, rotas da entidade user

// REQUISIÇÕES
//GET: Buscar uma ou mais informações no back-end
//POST: Criar uma nova informação no back-end
//PUT: Atualizar uma informação no back-end
//DELETE: Remover uma informação no back-end

// TIPOS DE PARÂMETROS

//Request Param: Parâmetros que vem da própria rota que identificam um recurso. A rota não sobrevive sem esse parametro.
//Query Param: Parâmetros que vem da própria rota geralmente opcionais para filtros, paginação
//Request body: Parâmetros para criação/atualização de informações

app.use('/upload', express.static(path.resolve(__dirname, '..', 'upload')));
app.listen(3333);