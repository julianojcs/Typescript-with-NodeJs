import { Router } from 'express'
import itemsRouter from './items.routes'

const routes = Router()

routes.use('/items', itemsRouter)

// routes.get('/', (request, response) => {
//     return response.json({message: 'Olá Dev!'})
// })

export default routes