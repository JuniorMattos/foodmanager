import { FastifyInstance } from 'fastify'

export default async function financialRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Financial API - placeholder' }
  })
}
