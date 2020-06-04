import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
    async create(request: Request, response: Response){
        const {
            name,
            email,
            whatsapp,
            city,
            latitude,
            longitude,
            uf,
            items
        } = request.body;

        /**
         * Criação de uma transaction para que caso a segunda query dê erro, não efetive a primeira.
         */
        const trx = await knex.transaction();

        const point = {
            name,
            image: 'https://images.unsplash.com/photo-1573481078935-b9605167e06b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        //Primeira Query
        //Knex devolve uma lista com ids inseridos no banco
        const insertedIds = await trx('points').insert(point);

        const point_id = insertedIds[0];

        //Utilização desses ids retornados para criar registros na tabela de relacionamento
        const pointItems = items.map((itemId: number) => {
            return {
                item_id: itemId,
                point_id
            }
        });
        //Segunda Query
        await trx('point_items').insert(pointItems);

        await trx.commit();

        return response.json({
            id: point_id,
            //Desestruturando os campos de um objeto formando um novo objeto com id
            ...point
         });
    };

    async show(request: Request, response: Response){
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return response.status(400).json({ message: 'Point not found.' });
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.item_id', id)
            .select('items.title');

        return response.json({ point, items });
    }

    async index(request: Request, response: Response){
        const { city, uf, items} = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.json(points)
    }
}

export default PointsController;