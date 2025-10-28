#!/usr/bin/env node
/*
  Backfill recent weekly analytics data into Neon via Prisma.
  - Creates customers with addresses
  - Creates orders over the last 7 days with items against existing products
  - Computes totalAmount from item prices

  Usage:
    node scripts/backfill-weekly-data.js

  Requirements:
    - DATABASE_URL set (Neon)
    - Prisma Client generated (npx prisma generate)
*/
const { PrismaClient, UserRole, OrderStatus } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  const now = new Date()
  console.log('🌱 Backfilling weekly analytics data...')

  try {
    // Ensure there are products; if not, create a minimal farmer + products
    let products = await prisma.product.findMany()
    if (products.length === 0) {
      console.log('No products found, creating a default farmer and products...')
      const farmerUser = await prisma.user.create({
        data: {
          name: 'Weekly Seed Farm',
          email: `farmer.weekly.${Date.now()}@local.test`,
          role: UserRole.FARMER,
          emailVerified: new Date(),
        },
      })
      const farmer = await prisma.farmer.create({
        data: {
          userId: farmerUser.id,
          farmName: 'Weekly Seed Farm',
          location: 'Bangalore',
          isApproved: true,
        },
      })
      products = await prisma.product.createMany({
        data: [
          { name: 'Spinach', category: 'Leafy Greens', basePrice: 40, unit: 'bunch', farmerId: farmer.id, images: ['/images/products/spinach.jpg'] },
          { name: 'Tomatoes', category: 'Vegetables', basePrice: 60, unit: 'kg', farmerId: farmer.id, images: ['/images/products/tomatoes.jpg'] },
          { name: 'Coriander', category: 'Herbs', basePrice: 20, unit: 'bunch', farmerId: farmer.id, images: ['/images/products/coriander.jpg'] },
          { name: 'Carrots', category: 'Vegetables', basePrice: 50, unit: 'kg', farmerId: farmer.id, images: ['/images/products/carrots.jpg'] },
        ],
      })
      products = await prisma.product.findMany()
    }

    // Create 15 customers with default addresses
    const customerCount = 15
    const customers = []
    for (let i = 0; i < customerCount; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Customer ${i + 1}`,
          email: `customer.weekly.${i}.${Date.now()}@local.test`,
          role: UserRole.CUSTOMER,
          emailVerified: new Date(),
        },
      })
      const customer = await prisma.customer.create({
        data: {
          userId: user.id,
          phone: `+91-98765${String(3200 + i).padStart(4, '0')}`,
          createdAt: new Date(now.getTime() - (i % 14) * 24 * 60 * 60 * 1000), // spread last 2 weeks
        },
      })
      await prisma.address.create({
        data: {
          customerId: customer.id,
          name: 'Home',
          street: `${100 + i} MG Road`,
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          isDefault: true,
          latitude: 12.9716 + Math.random() * 0.01,
          longitude: 77.5946 + Math.random() * 0.01,
        },
      })
      customers.push(customer)
    }

    // Build a map of customer -> default address
    const addresses = await prisma.address.findMany({
      where: { isDefault: true },
    })
    const addressByCustomer = new Map()
    for (const addr of addresses) addressByCustomer.set(addr.customerId, addr)

    // Helper to pick random elements
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

    // Create orders for the last 7 days
    const days = 7
    const ordersPerDayMin = 6
    const ordersPerDayMax = 12

    let createdOrders = 0
    for (let d = 0; d < days; d++) {
      const dayDate = new Date(now)
      dayDate.setDate(now.getDate() - d)
      dayDate.setHours(10, 0, 0, 0)
      const count = Math.floor(Math.random() * (ordersPerDayMax - ordersPerDayMin + 1)) + ordersPerDayMin

      for (let k = 0; k < count; k++) {
        const customer = pick(customers)
        const addr = addressByCustomer.get(customer.id)
        // create order with 1-3 items
        const itemsCount = 1 + Math.floor(Math.random() * 3)
        const orderItems = []
        let total = 0
        const usedProducts = [...products]
        for (let t = 0; t < itemsCount; t++) {
          const prod = pick(usedProducts)
          // remove to avoid duplicates in a single order
          usedProducts.splice(usedProducts.indexOf(prod), 1)
          const qty = clamp(Math.round(1 + Math.random() * 3), 1, 5)
          const price = Number(prod.basePrice)
          total += price * qty
          orderItems.push({ productId: prod.id, quantity: qty, price })
        }

        const order = await prisma.order.create({
          data: {
            customerId: customer.id,
            addressId: addr.id,
            deliverySlot: '9:00 AM - 12:00 PM',
            status: OrderStatus.DELIVERED,
            totalAmount: Number(total.toFixed(2)),
            deliveryDate: dayDate,
            specialNotes: null,
            createdAt: dayDate,
          },
        })

        await prisma.orderItem.createMany({
          data: orderItems.map((it) => ({
            orderId: order.id,
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
          })),
        })

        createdOrders++
      }
    }

    console.log(`✅ Backfill complete. Created ${customers.length} customers and ${createdOrders} orders across ${days} days.`)
  } catch (e) {
    console.error('❌ Backfill failed:', e)
    process.exitCode = 1
  } finally {
    // disconnect
    // eslint-disable-next-line no-undef
    await prisma.$disconnect()
  }
}

main()