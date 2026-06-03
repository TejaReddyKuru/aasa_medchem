import { PrismaClient, DimensionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.auditLog.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.quotationItem.deleteMany()
  await prisma.quotation.deleteMany()
  await prisma.inventoryTransaction.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const passwordHash = bcrypt.hashSync('password123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const seller = await prisma.user.create({
    data: {
      name: 'Demo Seller',
      email: 'seller@example.com',
      passwordHash,
      role: 'SELLER',
    },
  })

  console.log('Created users: admin@example.com, seller@example.com')

  // 2. Create Products
  // Formula: pricePerBaseUnit = pricePerKg / 1000 or pricePerL / 1000

  const products = [
    {
      sku: 'CHEM-HCL-001',
      name: 'Hydrochloric Acid (37%)',
      category: 'Acids',
      description: 'Industrial grade Hydrochloric Acid.',
      dimensionType: DimensionType.VOLUME,
      baseUnit: 'mL',
      pricePerBaseUnit: 0.15, // ₹150 per L -> 150 / 1000 = 0.15 per mL
      inventoryQuantity: 50000, // 50 L
      minimumStockLevel: 10000, // 10 L
    },
    {
      sku: 'CHEM-H2SO4-002',
      name: 'Sulfuric Acid (98%)',
      category: 'Acids',
      description: 'Highly concentrated Sulfuric Acid.',
      dimensionType: DimensionType.VOLUME,
      baseUnit: 'mL',
      pricePerBaseUnit: 0.20, // ₹200 per L -> 0.20 per mL
      inventoryQuantity: 40000, // 40 L
      minimumStockLevel: 5000, // 5 L
    },
    {
      sku: 'SOL-ETH-001',
      name: 'Ethanol (Absolute)',
      category: 'Solvents',
      description: '99.9% pure absolute ethanol.',
      dimensionType: DimensionType.VOLUME,
      baseUnit: 'mL',
      pricePerBaseUnit: 0.35, // ₹350 per L -> 0.35 per mL
      inventoryQuantity: 100000, // 100 L
      minimumStockLevel: 20000, // 20 L
    },
    {
      sku: 'SOL-ACE-002',
      name: 'Acetone',
      category: 'Solvents',
      description: 'Lab grade acetone.',
      dimensionType: DimensionType.VOLUME,
      baseUnit: 'mL',
      pricePerBaseUnit: 0.25, // ₹250 per L -> 0.25 per mL
      inventoryQuantity: 60000, // 60 L
      minimumStockLevel: 15000, // 15 L
    },
    {
      sku: 'SALT-NACL-001',
      name: 'Sodium Chloride',
      category: 'Salts',
      description: 'High purity NaCl.',
      dimensionType: DimensionType.WEIGHT,
      baseUnit: 'g',
      pricePerBaseUnit: 0.05, // ₹50 per kg -> 50 / 1000 = 0.05 per g
      inventoryQuantity: 200000, // 200 kg
      minimumStockLevel: 50000, // 50 kg
    },
  ]

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    })
    
    // Log initial stock as a transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId: product.id,
        quantity: p.inventoryQuantity,
        transactionType: 'STOCK_IN',
        remarks: 'Initial inventory seeding',
      }
    })
  }

  console.log('Created seed products.')
  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
