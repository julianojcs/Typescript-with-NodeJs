import { Router } from 'express'
import knex from '../database/connection'

const locationsRouter: Router = Router()

locationsRouter.post('/', async (request, response) => {
    const {
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
        items
    }: any = request.body

    const location: object = {
        image: "fake-image.png",
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
    }

    // newIds need to be an array of Ids
    const newIds: Array<number> = await knex('locations').insert(location)
    const locationId: number = newIds[0]

    if (items?.length) { // Same as: if(items && items.length) {
        const locationItems = items.map((item_id: number) => {
            return {
                item_id,
                location_id: locationId
            }
        })

        await knex('location_items').insert(locationItems)
    }

    return response.json({
        id: locationId,
        ...location
    })
})

export default locationsRouter


/*

//Transaction example:

locationsRouter.post('/', async (request, response) => {
    try {
        await knex.transaction(async trx => {
            const {
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf,
                items
            }: any = request.body

            const location: object = {
                image: "fake-image.png",
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            }

            // newIds need to be an array of Ids
            const newIds: Array<number> = await trx('locations').insert(location).transacting(trx)

            const locationId: number = newIds[0]

            const locationItems = items.map((item_id: number) => {
                return {
                    item_id,
                    location_id: locationId
                }
            })

            await trx('location_items').insert(locationItems).transacting(trx)
            console.log('1 new location created with id = ' + newIds)
            console.log(locationItems.length + ' new locationItems created.')

            return response.json({
                id: locationId,
                ...location
            })
        })
    } catch (error) {
        console.error(error);
        return response.json({
            error
        })
    }
})


*/