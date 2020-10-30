import express from 'express'
import cors from 'cors'
import path from 'path'
import routes from './routes'

const app = express()

app.use(cors())  // Libera tudo
// app.use(cors({
//     origin: ['http://localhost:3333', 'http://localhosts']
// }))

app.use(express.json())

app.use(routes)

//Configure static routes
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333, () => {
    console.log('Server up!')
})