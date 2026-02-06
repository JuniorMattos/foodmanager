import { FastifyInstance } from 'fastify'

export default async function productRoutes(fastify: FastifyInstance) {
  // Rota placeholder para teste de login
  fastify.get('/', async () => {
    return { message: 'Products API - placeholder' }
  })
}
