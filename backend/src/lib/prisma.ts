/**
 * Configuração do Prisma Client com Prisma Accelerate
 * Seguindo as melhores práticas para produção
 */

import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

dotenv.config({ path: '.env.local' })
dotenv.config()

// Singleton pattern para Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não encontrada. Verifique backend/.env.local')
    }

    return new PrismaClient({
      accelerateUrl: process.env.DATABASE_URL,
    }).$extends(withAccelerate())
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
