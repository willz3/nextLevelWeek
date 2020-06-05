import express from 'express';
import { celebrate, Joi } from 'celebrate';

import PointsController from './controller/PointsController';
import ItemsController from './controller/ItemsController';
import multer from 'multer';
import multerConfig from './config/multer';

// MÉTODOS
// Index: Listagens
// Show: um unico registro daquele tipo
// Create
// Update
// Delete
const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);


routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

routes.post('/points',
    upload.single('image'),
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        }),
    }, {
        abortEarly: false 
    }),
    pointsController.create);

export default routes;

/**
 * Procurar sobre para melhorar o projeto:
 * Lógica: Service pattern
 * Banco de dados: Repository pattern/Data Mapper
 */