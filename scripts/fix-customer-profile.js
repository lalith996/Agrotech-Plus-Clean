const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCustomerProfile() {
  console.log('🔧 Fixing customer profile...\n')

  try {
    // Find customer user
    const customerUser = await prisma.user.findUnique({
      where: { email: 'customer@demo.com' },
    })

    if (!customerUser) {
      console.log('❌ Customer user not found')
      return
    }

    console.log(`✓ Found customer user: ${customerUser.email}`)

    // Check if customer profile exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId: customerUser.id },
    })

    if (existingCustomer) {
      console.log('✓ Customer profile already exists')
      return
    }

    // Create customer profile
    const customer = await prisma.customer.create({
      data: {
        userId: customerUser.id,
      },
    })

    // Create a default address
    await prisma.address.create({
      data: {
        customerId: customer.id,
        name: 'Home',
        street: '123 Demo Street',
        city: 'Demo City',
        state: 'Demo State',
        postalCode: '12345',
        country: 'India',
        isDefault: true,
      },
    })

    console.log('✅ Customer profile and address created successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixCustomerProfile()
