import { FastifyInstance } from 'fastify'

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Orders API - placeholder' }
  })
}
