import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

export async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]
    
    // TODO: Implementar verificação JWT real
    // Por enquanto, usar mock para desenvolvimento
    if (token !== 'admin-mock-token') {
      return reply.status(401).send({ error: 'Token inválido' })
    }

    // Buscar usuário admin
    const user = await prisma.user.findFirst({
      where: {
        role: { in: ['super_admin', 'admin'] },
        is_active: true
      }
    })

    if (!user) {
      return reply.status(401).send({ error: 'Usuário não encontrado' })
    }

    // Adicionar usuário ao request
    request.user = user
  } catch (error) {
    console.error('Auth error:', error)
    return reply.status(500).send({ error: 'Erro na autenticação' })
  }
}

export async function authorizeAdmin(request: FastifyRequest, reply: FastifyReply, roles: string[]) {
  const user = request.user as any

  if (!user) {
    return reply.status(401).send({ error: 'Não autenticado' })
  }

  if (!roles.includes(user.role)) {
    return reply.status(403).send({ error: 'Permissão negada' })
  }

  return
}
