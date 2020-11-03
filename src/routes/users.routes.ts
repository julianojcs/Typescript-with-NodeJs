import { Router } from 'express'
import knes from '../database/connection'
import { hash } from 'bcryptjs'
import { jwt } from '../config';

const usersRouter: Router = Router()

usersRouter.get('/', async (request, response) => {
    const users = await knes('users').select('*')

    return response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { name, email, password } = request.body
    const passwordHashed:any = await hash(password, jwt.SALT_ROUNDS)
    const users = { 
        name, 
        email, 
        password: passwordHashed 
    }
    const newIds = await knes('users').insert(users)

    return response.json({
        id: newIds[0],
        ...users
    })
})

usersRouter.delete('/:id', async (request, response) => {
    const { id } = request.params

    const rows = await knes('users').where('id', id).delete() // Return the number of affected rows
        // .returning('id')

    return response.json(`${rows} row(s) deleted!`)
})

usersRouter.patch('/:id', async (request, response) => {
    const { id } = request.params
    const newId = request.body.id
    
    console.log(newId)

    const rows = await knes('users').where('id', id).update('id', newId) // Return the number of affected rows

    return response.json(`${rows} row(s) updated!`)
})

export default usersRouter