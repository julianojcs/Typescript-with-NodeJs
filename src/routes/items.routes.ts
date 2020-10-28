import { Router } from 'express'
import knes from '../database/connection'
import { staticUrl } from '../shared'

const itemsRouter: Router = Router()

itemsRouter.get('/', async (request, response) => {
    const items = await knes('items').select('*')
    const serializedItems = items.map((item: any) => {
        return {
            id: item.id,
            title: item.title,
            image_url: staticUrl + item.image
        }
    })
    return response.json(serializedItems)
})


export default itemsRouter