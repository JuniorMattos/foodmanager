import { FastifyInstance } from 'fastify'

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Users API - placeholder' }
  })
}
