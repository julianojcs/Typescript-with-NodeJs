import { Router } from 'express'
import multer from 'multer'
import { celebrate, Joi } from 'celebrate'
import knex from '../database/connection'
import multerConfig from '../config/multer'
import { staticUrl } from '../shared'

const locationsRouter: Router = Router()
const upload = multer(multerConfig)
const requestRules = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email().label('e-mail'), // .label(name): Overrides the key name in error messages.
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2).min(2).messages({
            'string.base': `"uf" should be a type of 'text'`,
            'string.empty': `"uf" cannot be an empty field`,
            'string.min': `"uf" should have a minimum length of {#limit}`,
            'string.max': `"uf" should have a maximum length of {#limit}`,
            'any.required': `"uf" is a required field`
          }),
        items: Joi.array().items(Joi.number()).required() // .array().items(Joi.number()): fiels are required and needs to be an array, and each items needs to be a number
    })
}
const joiOpts = {
    abortEarly: false,
    errors: {
        escapeHtml: true
    }
}

locationsRouter.post('/', celebrate(requestRules, joiOpts), async (request, response) => {
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

locationsRouter.get('/:id', async (request, response) => {
    const { id } = request.params

    // const location = await knex('locations').where('id', id).first()
    const location = await knex('locations').where('id', id).first().timeout(10000)

    if (!location) {
        return response.status(400).json({ message: `Item ${id} not found!`})
    }

    // const items = await knex('items')
    //     .join('location_items', 'items.id', '=', 'location_items.item_id'})
    //     .where('location_items.location_id', id)
    //     .select('items.title')

    const items = await knex('items')
        .join('location_items', {'items.id': 'location_items.item_id'})
        .where({'location_items.location_id': id})
        .select('items.*')
        .timeout(10000)
        .then((items) => { 
            console.log(items)
            return items.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    image_url: staticUrl + item.image
                }
            })
        })
        

    return response.json({
        ...location,
        items
    })
})

locationsRouter.get('/', async (request, response) => {
    const { city, uf, items } = request.query

    const parsedItems: Number[] = String(items).split(',').map(item => Number(item.trim()))

    const locations = await knex('locations')
    .join('location_items', 'locations.id', '=', 'location_items.location_id')
    .where(function() {
        if (items){    
            this.whereIn('location_items.item_id', parsedItems)
        }
    })
    .where(function() {
        if (city && uf) {
            this.where({
                city: String(city),
                uf:  String(uf)
            })
        } else if (city && !uf) {
            this.where({city: String(city)})
        } else if (!city && uf) {
            this.where({uf: String(uf)})
        }
    })
    .distinct()
    .debug(true)
    .select('locations.*')
    .then((locations) => { 
        return locations.map( async (location: any) => {
            const items = await knex('items')
            .join('location_items', {'items.id': 'location_items.item_id'})
            .where({'location_items.location_id': location.id})
            .select('items.*')
            .then((items) => { 
                return items.map((item: any) => {
                    return {
                        id: item.id,
                        title: item.title,
                        image_url: staticUrl + item.image
                    }
                })
            })
            console.log( {...location, items} )
            return { ...location, items }
        })
    })

    return response.json(locations)
})

locationsRouter.put('/:id', upload.single('image'), async (request, response) => {
    const { id } = request.params
    const image: string = request.file.filename
    const location: any = await knex('locations').where('id', id).first().select('id').timeout(10000)

    if (!location) {
        return response.status(400).json({ message: `Location ${id} not found!`})
    }

    // const locationUpdated = {
    //     ...location,
    //     image
    // }
    const locationUpdated = { image }

    await knex('locations').update(locationUpdated).where('id', id)

    return response.json(locationUpdated.image)
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