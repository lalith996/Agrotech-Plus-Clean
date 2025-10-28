#!/usr/bin/env node

/**
 * Database and API Connection Test Script
 * Tests all critical database connections and API endpoints
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
}

async function testDatabaseConnection() {
  console.log('\n📊 Testing Database Connection...\n')
  
  try {
    await prisma.$connect()
    log.success('Database connected successfully')
    
    // Test basic query
    const userCount = await prisma.user.count()
    log.success(`Found ${userCount} users in database`)
    
    return true
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`)
    return false
  }
}

async function testDatabaseModels() {
  console.log('\n📦 Testing Database Models...\n')
  
  const models = [
    'user',
    'customer', 
    'farmer',
    'product',
    'order',
    'subscription',
    'address',
    'deliveryZone',
    'qCResult',
    'certification',
  ]
  
  let passed = 0
  let failed = 0
  
  for (const model of models) {
    try {
      const count = await prisma[model].count()
      log.success(`Model '${model}': ${count} records`)
      passed++
    } catch (error) {
      log.error(`Model '${model}': ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n${passed} passed, ${failed} failed\n`)
  return failed === 0
}

async function testDatabaseRelations() {
  console.log('\n🔗 Testing Database Relations...\n')
  
  try {
    // Test User -> Customer relation
    const userWithCustomer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      include: { customer: true },
    })
    if (userWithCustomer) {
      log.success('User -> Customer relation working')
    } else {
      log.warn('No customers found to test relation')
    }
    
    // Test User -> Farmer relation
    const userWithFarmer = await prisma.user.findFirst({
      where: { role: 'FARMER' },
      include: { farmer: true },
    })
    if (userWithFarmer) {
      log.success('User -> Farmer relation working')
    } else {
      log.warn('No farmers found to test relation')
    }
    
    // Test Product -> Farmer relation
    const productWithFarmer = await prisma.product.findFirst({
      include: { farmer: { include: { user: true } } },
    })
    if (productWithFarmer) {
      log.success('Product -> Farmer relation working')
    } else {
      log.warn('No products found to test relation')
    }
    
    // Test Order -> Customer relation
    const orderWithCustomer = await prisma.order.findFirst({
      include: {
        customer: true,
        items: { include: { product: true } },
        address: true,
      },
    })
    if (orderWithCustomer) {
      log.success('Order -> Customer/Items/Address relations working')
    } else {
      log.warn('No orders found to test relations')
    }
    
    return true
  } catch (error) {
    log.error(`Relations test failed: ${error.message}`)
    return false
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔑 Checking Environment Variables...\n')
  
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]
  
  const optional = [
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'STRIPE_SECRET_KEY',
    'AWS_ACCESS_KEY_ID',
    'GOOGLE_CLIENT_ID',
    'GEMINI_API_KEY',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ]
  
  let missingRequired = []
  let missingOptional = []
  
  for (const key of required) {
    if (process.env[key]) {
      log.success(`${key} is set`)
    } else {
      log.error(`${key} is MISSING (REQUIRED)`)
      missingRequired.push(key)
    }
  }
  
  console.log('')
  
  for (const key of optional) {
    if (process.env[key]) {
      log.success(`${key} is set`)
    } else {
      log.warn(`${key} is missing (optional - some features may not work)`)
      missingOptional.push(key)
    }
  }
  
  if (missingRequired.length > 0) {
    console.log(`\n${colors.red}Missing required variables:${colors.reset}`)
    missingRequired.forEach(key => console.log(`  - ${key}`))
  }
  
  if (missingOptional.length > 0) {
    console.log(`\n${colors.yellow}Missing optional variables:${colors.reset}`)
    missingOptional.forEach(key => console.log(`  - ${key}`))
  }
  
  return missingRequired.length === 0
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints (Server must be running on port 3000)...\n')
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  const endpoints = [
    { path: '/api/health', method: 'GET', auth: false },
    { path: '/api/products', method: 'GET', auth: false },
    { path: '/api/farmers', method: 'GET', auth: false },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      })
      
      if (response.ok) {
        log.success(`${endpoint.method} ${endpoint.path} - Status: ${response.status}`)
        passed++
      } else {
        log.warn(`${endpoint.method} ${endpoint.path} - Status: ${response.status}`)
        failed++
      }
    } catch (error) {
      log.error(`${endpoint.method} ${endpoint.path} - Error: ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n${passed} passed, ${failed} failed/warnings\n`)
  
  if (failed > 0 && failed === endpoints.length) {
    log.warn('All API tests failed - is the server running? (npm run dev)')
    return false
  }
  
  return true
}

async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════╗')
  console.log('║   AgroTrack+ Database & Backend Connection Tests   ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  
  const results = {
    database: false,
    models: false,
    relations: false,
    env: false,
    api: false,
  }
  
  // Run tests
  results.database = await testDatabaseConnection()
  
  if (results.database) {
    results.models = await testDatabaseModels()
    results.relations = await testDatabaseRelations()
  } else {
    log.error('Skipping model and relation tests due to database connection failure')
  }
  
  results.env = await testEnvironmentVariables()
  results.api = await testAPIEndpoints()
  
  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════╗')
  console.log('║                     TEST SUMMARY                      ║')
  console.log('╚═══════════════════════════════════════════════════════╝\n')
  
  const summary = [
    { name: 'Database Connection', result: results.database },
    { name: 'Database Models', result: results.models },
    { name: 'Database Relations', result: results.relations },
    { name: 'Environment Variables', result: results.env },
    { name: 'API Endpoints', result: results.api },
  ]
  
  summary.forEach(({ name, result }) => {
    if (result) {
      log.success(name)
    } else {
      log.error(name)
    }
  })
  
  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    console.log(`\n${colors.green}✓ All tests passed! Your backend is properly configured.${colors.reset}\n`)
  } else {
    console.log(`\n${colors.yellow}⚠ Some tests failed. Please check the errors above.${colors.reset}\n`)
  }
  
  // Cleanup
  await prisma.$disconnect()
  
  process.exit(allPassed ? 0 : 1)
}

// Run tests
runAllTests().catch((error) => {
  console.error(`\n${colors.red}Fatal error:${colors.reset}`, error)
  process.exit(1)
})
