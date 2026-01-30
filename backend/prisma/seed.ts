import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Burger Express',
      slug: 'burger-express',
      address: 'Rua das Lanches, 123, São Paulo - SP',
      phone: '+55 11 98765-4321',
      email: 'contato@burgerexpress.com',
      deliveryFee: 5.00,
    },
  })

  console.log(`✅ Created tenant: ${tenant.name}`)

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const vendorPassword = await bcrypt.hash('vendor123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@burgerexpress.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  })

  const manager = await prisma.user.create({
    data: {
      email: 'manager@burgerexpress.com',
      name: 'Gerente',
      password: managerPassword,
      role: 'MANAGER',
      tenantId: tenant.id,
    },
  })

  const vendor = await prisma.user.create({
    data: {
      email: 'vendor@burgerexpress.com',
      name: 'Vendedor',
      password: vendorPassword,
      role: 'VENDOR',
      tenantId: tenant.id,
    },
  })

  console.log(`✅ Created users: admin, manager, vendor`)

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Hambúrgueres',
        description: 'Nossos hambúrgueres artesanais',
        orderIndex: 1,
      },
    }),
    prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Bebidas',
        description: 'Refrigerantes e sucos naturais',
        orderIndex: 2,
      },
    }),
    prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Acompanhamentos',
        description: 'Batatas fritas e saladas',
        orderIndex: 3,
      },
    }),
    prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Sobremesas',
        description: 'Doces e sobremesas',
        orderIndex: 4,
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create products
  const products = await Promise.all([
    // Hambúrgueres
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[0].id,
        name: 'X-Burger',
        description: 'Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate, molho especial',
        price: 25.90,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 1,
        preparationTime: 15,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[0].id,
        name: 'X-Bacon',
        description: 'Pão brioche, hambúrguer 180g, bacon crocante, queijo cheddar, alface, tomate',
        price: 29.90,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 2,
        preparationTime: 18,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[0].id,
        name: 'X-Egg',
        description: 'Pão brioche, hambúrguer 180g, ovo frito, queijo cheddar, alface, tomate',
        price: 27.90,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 3,
        preparationTime: 16,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[0].id,
        name: 'X-Tudo',
        description: 'Pão brioche, 2 hambúrgueres 180g, bacon, ovo, queijo, calabresa, alface, tomate',
        price: 35.90,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 4,
        preparationTime: 20,
      },
    }),

    // Bebidas
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[1].id,
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná, Fanta, Sprite',
        price: 6.00,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        isAvailable: true,
        orderIndex: 1,
        preparationTime: 2,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[1].id,
        name: 'Suco Natural',
        description: 'Laranja, Limão, Maracujá, Morango (500ml)',
        price: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        isAvailable: true,
        orderIndex: 2,
        preparationTime: 5,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[1].id,
        name: 'Água Mineral',
        description: 'Com ou sem gás (500ml)',
        price: 3.00,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        isAvailable: true,
        orderIndex: 3,
        preparationTime: 1,
      },
    }),

    // Acompanhamentos
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[2].id,
        name: 'Batata Frita',
        description: 'Porção média (200g) com molho especial',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3901d8c?w=400',
        isAvailable: true,
        orderIndex: 1,
        preparationTime: 8,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[2].id,
        name: 'Onion Rings',
        description: 'Anéis de cebola empanados (150g)',
        price: 15.00,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3901d8c?w=400',
        isAvailable: true,
        orderIndex: 2,
        preparationTime: 10,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[2].id,
        name: 'Salada Caesar',
        description: 'Folhas verdes, croutons, parmesão, molho caesar',
        price: 10.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        isAvailable: true,
        orderIndex: 3,
        preparationTime: 5,
      },
    }),

    // Sobremesas
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[3].id,
        name: 'Sundae',
        description: 'Sorvete de baunilha com calda de chocolate',
        price: 12.00,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 1,
        preparationTime: 3,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[3].id,
        name: 'Petit Gateau',
        description: 'Bolo de chocolate quente com sorvete',
        price: 18.00,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 2,
        preparationTime: 8,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: categories[3].id,
        name: 'Mousse',
        description: 'Mousse de limão ou chocolate',
        price: 8.00,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        isAvailable: true,
        orderIndex: 3,
        preparationTime: 2,
      },
    }),
  ])

  console.log(`✅ Created ${products.length} products`)

  // Create product customizations
  const customizations = await Promise.all([
    // X-Burger customizations
    prisma.productCustomization.create({
      data: {
        productId: products[0].id,
        name: 'Bacon Extra',
        type: 'ADDITION',
        price: 5.00,
        isAvailable: true,
      },
    }),
    prisma.productCustomization.create({
      data: {
        productId: products[0].id,
        name: 'Queijo Extra',
        type: 'ADDITION',
        price: 3.00,
        isAvailable: true,
      },
    }),
    prisma.productCustomization.create({
      data: {
        productId: products[0].id,
        name: 'Sem Alface',
        type: 'REMOVAL',
        price: 0.00,
        isAvailable: true,
      },
    }),
    prisma.productCustomization.create({
      data: {
        productId: products[0].id,
        name: 'Sem Tomate',
        type: 'REMOVAL',
        price: 0.00,
        isAvailable: true,
      },
    }),

    // X-Bacon customizations
    prisma.productCustomization.create({
      data: {
        productId: products[1].id,
        name: 'Queijo Extra',
        type: 'ADDITION',
        price: 3.00,
        isAvailable: true,
      },
    }),
    prisma.productCustomization.create({
      data: {
        productId: products[1].id,
        name: 'Ovo Extra',
        type: 'ADDITION',
        price: 4.00,
        isAvailable: true,
      },
    }),
    prisma.productCustomization.create({
      data: {
        productId: products[1].id,
        name: 'Sem Alface',
        type: 'REMOVAL',
        price: 0.00,
        isAvailable: true,
      },
    }),
  ])

  console.log(`✅ Created ${customizations.length} product customizations`)

  // Create inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Pão de Hambúrguer',
        description: 'Pães brioche artesanais',
        quantity: 100,
        minQuantity: 20,
        unit: 'un',
        cost: 2.50,
        supplier: 'Padaria Local',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Carne Bovina',
        description: 'Hambúrguer 180g bovino',
        quantity: 50,
        minQuantity: 10,
        unit: 'kg',
        cost: 25.00,
        supplier: 'Açougue Central',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Queijo Cheddar',
        description: 'Fatias de queijo cheddar',
        quantity: 200,
        minQuantity: 30,
        unit: 'un',
        cost: 1.20,
        supplier: 'Laticínios SA',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Bacon',
        description: 'Fatias de bacon',
        quantity: 100,
        minQuantity: 20,
        unit: 'un',
        cost: 0.80,
        supplier: 'Frigorífico Municipal',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Alface',
        description: 'Folhas de alface fresca',
        quantity: 30,
        minQuantity: 5,
        unit: 'un',
        cost: 1.50,
        supplier: 'Hortifruti Orgânico',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Tomate',
        description: 'Tomates frescos',
        quantity: 30,
        minQuantity: 5,
        unit: 'un',
        cost: 1.20,
        supplier: 'Hortifruti Orgânico',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Batata Congelada',
        description: 'Batata pré-frita congelada',
        quantity: 20,
        minQuantity: 5,
        unit: 'kg',
        cost: 8.00,
        supplier: 'Alimentos Congelados SA',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        tenantId: tenant.id,
        name: 'Refrigerante Lata',
        description: 'Refrigerantes em lata 350ml',
        quantity: 100,
        minQuantity: 20,
        unit: 'un',
        cost: 2.50,
        supplier: 'Distribuidora de Bebidas',
      },
    }),
  ])

  console.log(`✅ Created ${inventoryItems.length} inventory items`)

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: 'ORD-001',
        customerName: 'João Silva',
        customerPhone: '+55 11 91234-5678',
        deliveryType: 'DELIVERY',
        status: 'DELIVERED',
        totalAmount: 35.90,
        deliveryFee: 5.00,
        subtotal: 30.90,
        userId: vendor.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: 'ORD-002',
        customerName: 'Maria Santos',
        customerPhone: '+55 11 98765-4321',
        deliveryType: 'PICKUP',
        status: 'PREPARING',
        totalAmount: 41.90,
        subtotal: 41.90,
        userId: vendor.id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
    prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: 'ORD-003',
        customerName: 'Pedro Costa',
        customerPhone: '+55 11 97654-3210',
        deliveryType: 'DELIVERY',
        status: 'PENDING',
        totalAmount: 53.90,
        deliveryFee: 5.00,
        subtotal: 48.90,
        userId: vendor.id,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    }),
  ])

  console.log(`✅ Created ${orders.length} sample orders`)

  // Create order items
  await Promise.all([
    // Order 1 items
    prisma.orderItem.create({
      data: {
        orderId: orders[0].id,
        productId: products[3].id, // X-Tudo
        quantity: 1,
        unitPrice: 35.90,
        totalPrice: 35.90,
      },
    }),
    // Order 2 items
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[1].id, // X-Bacon
        quantity: 1,
        unitPrice: 29.90,
        totalPrice: 29.90,
      },
    }),
    prisma.orderItem.create({
      data: {
        orderId: orders[1].id,
        productId: products[7].id, // Batata Frita
        quantity: 1,
        unitPrice: 12.00,
        totalPrice: 12.00,
      },
    }),
    // Order 3 items
    prisma.orderItem.create({
      data: {
        orderId: orders[2].id,
        productId: products[0].id, // X-Burger
        quantity: 2,
        unitPrice: 25.90,
        totalPrice: 51.80,
      },
    }),
  ])

  console.log(`✅ Created order items`)

  // Create payments
  await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        method: 'CREDIT_CARD',
        amount: 35.90,
        status: 'PAID',
        transactionId: 'txn_123456',
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        method: 'PIX',
        amount: 41.90,
        status: 'PENDING',
        pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        pixCode: '00020126580014br.gov.bcb.pix01361234567890123456789',
      },
    }),
  ])

  console.log(`✅ Created payments`)

  // Create financial records
  await Promise.all([
    prisma.financialRecord.create({
      data: {
        tenantId: tenant.id,
        type: 'INCOME',
        description: 'Vendas do dia',
        amount: 1250.00,
        category: 'vendas',
        date: new Date(),
      },
    }),
    prisma.financialRecord.create({
      data: {
        tenantId: tenant.id,
        type: 'EXPENSE',
        description: 'Compra de insumos',
        amount: 450.00,
        category: 'compras',
        date: new Date(),
      },
    }),
    prisma.financialRecord.create({
      data: {
        tenantId: tenant.id,
        type: 'EXPENSE',
        description: 'Aluguel mensal',
        amount: 800.00,
        category: 'aluguel',
        date: new Date(),
      },
    }),
  ])

  console.log(`✅ Created financial records`)

  // Create settings
  await Promise.all([
    prisma.setting.create({
      data: {
        tenantId: tenant.id,
        key: 'business_hours',
        value: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '11:00', close: '22:00' },
        },
        isPublic: true,
      },
    }),
    prisma.setting.create({
      data: {
        tenantId: tenant.id,
        key: 'delivery_settings',
        value: {
          enabled: true,
          fee: 5.00,
          min_order_value: 20.00,
          estimated_time: 30,
          max_distance: 10,
        },
        isPublic: true,
      },
    }),
    prisma.setting.create({
      data: {
        tenantId: tenant.id,
        key: 'payment_methods',
        value: {
          pix: { enabled: true },
          credit_card: { enabled: true, installments: true },
          debit_card: { enabled: true },
          cash: { enabled: true },
          meal_voucher: { enabled: true },
        },
        isPublic: true,
      },
    }),
  ])

  console.log(`✅ Created settings`)

  console.log('\n🎉 Database seed completed successfully!')
  console.log('\n📋 Login credentials:')
  console.log('👤 Admin: admin@burgerexpress.com / admin123')
  console.log('👤 Manager: manager@burgerexpress.com / manager123')
  console.log('👤 Vendor: vendor@burgerexpress.com / vendor123')
  console.log('\n🏪 Tenant: burger-express')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
