/**
 * Seed Demo Accounts
 * Creates demo users for all roles if they don't exist
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDemoAccounts() {
  console.log('🌱 Seeding demo accounts...\n')

  const demoAccounts = [
    {
      email: 'customer@demo.com',
      name: 'Demo Customer',
      role: 'CUSTOMER',
      password: 'demo123456',
    },
    {
      email: 'farmer@demo.com',
      name: 'Demo Farmer',
      role: 'FARMER',
      password: 'demo123456',
      city: 'Bangalore',
      farmName: 'Green Valley Farm',
      location: 'Bangalore Rural',
      phone: '+91-9876543210',
    },
    {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'ADMIN',
      password: 'demo123456',
      city: 'Bangalore',
    },
    {
      email: 'driver@demo.com',
      name: 'Demo Driver',
      role: 'DRIVER',
      password: 'demo123456',
      city: 'Bangalore',
      phone: '+91-9876543211',
    },
    {
      email: 'operations@demo.com',
      name: 'Demo Operations',
      role: 'OPERATIONS',
      password: 'demo123456',
      city: 'Bangalore',
    },
  ]

  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      })

      if (existingUser) {
        console.log(`✓ ${account.role} account already exists: ${account.email}`)
        continue
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: account.email,
          name: account.name,
          role: account.role,
          passwordHash: hashedPassword,
          emailVerified: new Date(),
          city: account.city || null,
        },
      })

      // Create role-specific profile if needed
      if (account.role === 'FARMER') {
        await prisma.farmer.create({
          data: {
            userId: user.id,
            farmName: account.farmName,
            location: account.location,
            description: 'Demo farmer account for testing',
            phone: account.phone,
            isApproved: true,
          },
        })
      } else if (account.role === 'CUSTOMER') {
        // Create customer profile
        await prisma.customer.create({
          data: {
            userId: user.id,
            address: '123 Demo Street, Demo City',
            phone: '+91-9876543299',
          },
        })
      }

      console.log(`✓ Created ${account.role} account: ${account.email}`)
    } catch (error) {
      console.error(`✗ Failed to create ${account.role} account:`, error.message)
    }
  }

  console.log('\n✅ Demo accounts seeded successfully!\n')
  console.log('📝 Demo Credentials:')
  console.log('─'.repeat(50))
  demoAccounts.forEach(account => {
    console.log(`${account.role.padEnd(12)} | ${account.email.padEnd(25)} | ${account.password}`)
  })
  console.log('─'.repeat(50))
  console.log('\n🔗 Access demo login page at: /demo-login\n')
}

createDemoAccounts()
  .catch((e) => {
    console.error('Error seeding demo accounts:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
