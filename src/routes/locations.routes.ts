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

    const transaction = await knex.transaction();
    // newIds need to be an array of Ids
    const newIds: Array<number> = await transaction('locations').insert(location)
    const location_id: number = newIds[0]

    if (items?.length) { // Same as: if(items && items.length) {
        let itemNotFound: number|undefined = undefined

        const itemsBd = await transaction('items').select('id')

        const itemsIdBd: Array<number> = itemsBd.map(item => {
            return item.id
        })
        
        items.forEach((item: number) => {
            if(!itemsIdBd.includes(item)) {
                itemNotFound = item
            }
        })
        
        if (itemNotFound) {
            transaction.rollback()
            return response.status(400).json({ message: `Item ${itemNotFound} not found!`})
        }

        const locationItems = items.map((item_id: number) => {
        // const locationItems = items.map(async (item_id: number) => {
            // const selectedItem = await transaction('items').where('id', item_id).first()
            // if (!selectedItem) {
            //     return response.status(400).json({ message: `Item ${item_id} not itemNotFound!`})
            // }

            return {
                item_id,
                location_id
            }
        })

        await transaction('location_items').insert(locationItems)
    }

    await transaction.commit();

    return response.json({
        id: location_id,
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

            const location_id: number = newIds[0]

            if (items?.length) {
                const locationItems = items.map((item_id: number) => {
                    return {
                        item_id,
                        location_id
                    }
                })

                await trx('location_items').insert(locationItems).transacting(trx)
                console.log(locationItems.length + ' new locationItems created.')
            }

            console.log('1 new location created with id = ' + newIds)

            return response.json({
                id: location_id,
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