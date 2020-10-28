import { Router } from 'express'
import itemsRouter from './items.routes'
import locationsRouter from './locations.routes'

const routes = Router()

routes.use('/items', itemsRouter)
routes.use('/locations', locationsRouter)

// routes.get('/', (request, response) => {
//     return response.json({message: 'Olá Dev!'})
// })

export default routes