import { FastifyRequest, FastifyReply } from 'fastify'

export async function tenantMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Tenant middleware simplificado - não faz nada por enquanto
  // Em produção, validaria o tenant da requisição
}
