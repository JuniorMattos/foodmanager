import { FastifyInstance } from 'fastify'

export default async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Inventory API - placeholder' }
  })
}
