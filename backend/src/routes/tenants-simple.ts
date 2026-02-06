import { FastifyInstance } from 'fastify'

export default async function tenantRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'Tenants API - placeholder' }
  })
}
