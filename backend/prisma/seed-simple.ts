import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar tenant de teste
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'burgerexpress' },
    update: {},
    create: {
      name: 'Burger Express',
      slug: 'burgerexpress',
    },
  })

  console.log('✅ Tenant criado:', tenant.name)

  // Criar usuários de teste
  const users = [
    {
      email: 'admin@burgerexpress.com',
      name: 'Administrador',
      password: 'admin123',
      role: 'ADMIN',
    },
    {
      email: 'manager@burgerexpress.com',
      name: 'Gerente',
      password: 'manager123',
      role: 'MANAGER',
    },
    {
      email: 'vendor@burgerexpress.com',
      name: 'Vendedor',
      password: 'vendor123',
      role: 'VENDOR',
    },
    {
      email: 'customer@test.com',
      name: 'Cliente Teste',
      password: 'customer123',
      role: 'CUSTOMER',
    },
  ]

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const user = await prisma.user.upsert({
      where: { 
        email_tenantId: {
          email: userData.email,
          tenantId: tenant.id,
        }
      },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        tenantId: tenant.id,
      },
    })

    console.log(`✅ Usuário criado: ${user.email} (${user.role})`)
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
