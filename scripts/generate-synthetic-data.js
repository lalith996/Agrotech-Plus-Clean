/*
  Synthetic Data Generator for AgroTrack+
  - Populates realistic data spanning orders, subscriptions, products, QC results, deliveries,
    search queries, and notifications to support AI/ML features:
    1) Demand forecasting & inventory optimization
    2) Dynamic pricing engine
    3) Personalized recommendations
    4) Churn prediction & retention
    5) NLP: search queries and customer notes

  Usage:
    DATABASE_URL=postgres://... node scripts/generate-synthetic-data.js [--customers=INT] [--farmers=INT] [--drivers=INT] [--admins=INT] [--ops=INT] [--weeks=INT] [--validate=true|false]
*/

const { PrismaClient, UserRole, OrderStatus, SubscriptionStatus } = require('@prisma/client')
const prisma = new PrismaClient()

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randFloat(min, max, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)) }
function sample(arr) { return arr[randInt(0, arr.length - 1)] }
function chance(p) { return Math.random() < p }

// Simple argv parser: --key=value or --flag
function parseArgs() {
  const defaults = {
    customers: 100,
    farmers: 12,
    drivers: 8,
    admins: 1,
    ops: 2,
    weeks: 52,
    validate: true,
  }
  const args = { ...defaults }
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue
    const [rawKey, rawVal] = arg.slice(2).split('=')
    const key = rawKey.trim()
    const val = rawVal === undefined ? true : rawVal.trim()
    if (['customers','farmers','drivers','admins','ops','weeks'].includes(key)) {
      args[key] = parseInt(val, 10)
    } else if (key === 'validate') {
      args[key] = val === 'true' || val === true
    }
  }
  return args
}

const categories = ['Leafy Greens', 'Root Vegetables', 'Fruits', 'Herbs', 'Grains']
const units = ['kg', 'bundle', 'box']
const cities = ['Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune']

function seasonalFactor(category, date) {
  const m = date.getMonth() // 0..11
  // Simple seasonality: Fruits peak in summer (Apr-Jul), Greens peak in winter (Nov-Feb)
  if (category === 'Fruits') {
    return [0.9,0.9,1.0,1.2,1.3,1.3,1.2,1.0,1.0,0.9,0.9,0.9][m]
  }
  if (category === 'Leafy Greens') {
    return [1.2,1.3,1.3,1.1,1.0,0.9,0.9,0.9,1.0,1.1,1.2,1.3][m]
  }
  return 1.0
}

async function ensureUsers({ customers = 50, farmers = 8, drivers = 5, admins = 1, ops = 2 }) {
  const created = { customers: [], farmers: [], drivers: [], admins: [], ops: [] }

  // Admins
  for (let i = 0; i < admins; i++) {
    const email = `admin.synthetic.${i}@agrotrack.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: `Admin ${i}`, email, role: UserRole.ADMIN, city: sample(cities) },
    })
    created.admins.push(user)
  }
  // Ops
  for (let i = 0; i < ops; i++) {
    const email = `ops.synthetic.${i}@agrotrack.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: `Operations ${i}`, email, role: UserRole.OPERATIONS, city: sample(cities) },
    })
    created.ops.push(user)
  }
  // Drivers
  for (let i = 0; i < drivers; i++) {
    const email = `driver.synthetic.${i}@agrotrack.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: `Driver ${i}`, email, role: UserRole.DRIVER, city: sample(cities) },
    })
    created.drivers.push(user)
  }
  // Farmers
  for (let i = 0; i < farmers; i++) {
    const email = `farmer.synthetic.${i}@agrotrack.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: `Farmer ${i}`, email, role: UserRole.FARMER, city: sample(cities) },
    })
    const farmer = await prisma.farmer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        farmName: `Farm ${i}`,
        location: sample(cities),
        description: 'Synthetic farm for testing',
        phone: `+91-${randInt(7000000000, 9999999999)}`,
        isApproved: chance(0.9),
      },
    })
    created.farmers.push({ user, farmer })
  }
  // Customers
  for (let i = 0; i < customers; i++) {
    const email = `customer.synthetic.${i}@example.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: `Customer ${i}`, email, role: UserRole.CUSTOMER, city: sample(cities) },
    })
    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, phone: `+91-${randInt(6000000000, 9999999999)}` },
    })
    // One default address
    await prisma.address.create({
      data: {
        customerId: customer.id,
        name: 'Home',
        street: `${randInt(1, 200)} MG Road`,
        city: user.city || sample(cities),
        state: 'KA',
        zipCode: `${randInt(560001, 560999)}`,
        isDefault: true,
        latitude: randFloat(12.8, 13.2),
        longitude: randFloat(77.4, 77.8),
      },
    })
    created.customers.push({ user, customer })
  }

  return created
}

async function createProducts(farmers) {
  const products = []
  for (const { farmer } of farmers) {
    const count = randInt(3, 6)
    for (let i = 0; i < count; i++) {
      const category = sample(categories)
      const p = await prisma.product.create({
        data: {
          name: `${category} ${randInt(1, 99)}`,
          category,
          description: 'Synthetic product',
          images: [],
          basePrice: randFloat(20, 200),
          unit: sample(units),
          isActive: true,
          farmerId: farmer.id,
        },
      })
      products.push(p)
    }
  }
  return products
}

async function createSubscriptions(customers, products) {
  const subscriptions = []
  for (const { customer } of customers) {
    if (!chance(0.7)) continue // 70% customers have subscriptions
    const status = sample([SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED, SubscriptionStatus.CANCELLED])
    const sub = await prisma.subscription.create({
      data: {
        customerId: customer.id,
        deliveryZone: sample(['North', 'South', 'East', 'West']),
        deliveryDay: sample(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']),
        status,
        startDate: new Date(Date.now() - randInt(30, 180) * 24*60*60*1000),
      },
    })
    const itemsCount = randInt(1, 4)
    const chosen = [...products].sort(() => 0.5 - Math.random()).slice(0, itemsCount)
    for (const p of chosen) {
      await prisma.subscriptionItem.create({
        data: {
          subscriptionId: sub.id,
          productId: p.id,
          quantity: randFloat(0.5, 3),
          frequency: 'weekly',
        },
      })
    }
    subscriptions.push(sub)
  }
  return subscriptions
}

async function createFarmerDeliveriesAndQC(farmers, products) {
  const qcResults = []
  for (const { farmer } of farmers) {
    const deliveries = randInt(8, 20)
    for (let i = 0; i < deliveries; i++) {
      const date = new Date(Date.now() - randInt(7, 120) * 24*60*60*1000)
      const delivery = await prisma.farmerDelivery.create({
        data: {
          farmerId: farmer.id,
          deliveryDate: date,
          status: sample(['scheduled','picked_up','delivery_in_transit','delivered']),
          notes: 'Synthetic delivery',
        },
      })
      const batchProducts = [...products].filter(p => p.farmerId === farmer.id).sort(() => 0.5 - Math.random()).slice(0, randInt(1, 4))
      for (const p of batchProducts) {
        const expected = randFloat(10, 100)
        const accepted = Math.max(0, expected - randFloat(0, expected * 0.2))
        const rejected = Math.max(0, expected - accepted)
        const qc = await prisma.qCResult.create({
          data: {
            farmerDeliveryId: delivery.id,
            productId: p.id,
            farmerId: farmer.id,
            expectedQuantity: expected,
            acceptedQuantity: accepted,
            rejectedQuantity: rejected,
            rejectionReasons: rejected > 0 ? ['bruised','size_mismatch'].slice(0, randInt(0,2)) : [],
            photos: [],
            inspectorId: 'inspector.synthetic',
            notes: chance(0.3) ? 'Minor defects observed' : null,
            timestamp: date,
          },
        })
        qcResults.push(qc)
      }
    }
  }
  return qcResults
}

async function createOrders(customers, products, subscriptions, weeks) {
  const orders = []
  for (const { user, customer } of customers) {
    const address = await prisma.address.findFirst({ where: { customerId: customer.id } })
    if (!address) continue

    // Determine weekly order propensity (customers with active subs order more)
    const hasActiveSub = !!subscriptions.find(s => s.customerId === customer.id && s.status === SubscriptionStatus.ACTIVE)
    const weeklyOrders = hasActiveSub ? randInt(1, 2) : chance(0.5) ? 1 : 0

    // Generate across last N weeks
    for (let w = 0; w < weeks; w++) {
      for (let k = 0; k < weeklyOrders; k++) {
        const deliveryDate = new Date(Date.now() - w * 7 * 24*60*60*1000 - randInt(0, 5) * 24*60*60*1000)
        const chosen = [...products].sort(() => 0.5 - Math.random()).slice(1, randInt(2, 5))
        const items = []
        let total = 0
        for (const p of chosen) {
          const demandFactor = seasonalFactor(p.category, deliveryDate)
          const quantity = randFloat(0.5, 3)
          const price = parseFloat((p.basePrice * demandFactor * (1 + randFloat(-0.15, 0.25))).toFixed(2))
          total += price
          items.push({ productId: p.id, quantity, price })
        }
        const order = await prisma.order.create({
          data: {
            customerId: customer.id,
            subscriptionId: null,
            addressId: address.id,
            deliverySlot: sample(['9:00-12:00','12:00-15:00','15:00-18:00']),
            status: sample([OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.PICKED, OrderStatus.ORDER_IN_TRANSIT]),
            totalAmount: parseFloat(total.toFixed(2)),
            deliveryDate,
            specialNotes: chance(0.2) ? 'Please deliver early' : null,
          },
        })
        for (const it of items) {
          await prisma.orderItem.create({ data: { orderId: order.id, productId: it.productId, quantity: it.quantity, price: it.price } })
        }
        orders.push(order)
      }
    }
  }
  return orders
}

async function createSearchQueries(customers, products) {
  const queries = []
  const qTerms = ['organic', 'fresh', 'spinach', 'tomato', 'mango', 'delivery', 'weekly box', 'discount', 'veg bundle']
  for (const { user } of customers) {
    const count = randInt(2, 10)
    for (let i = 0; i < count; i++) {
      const query = sample(qTerms)
      const clicked = chance(0.4)
      const clickedId = clicked ? sample(products).id : null
      const q = await prisma.searchQuery.create({
        data: {
          query,
          userId: user.id,
          filters: clicked ? { category: sample(categories) } : null,
          results: randInt(0, 30),
          clicked,
          clickedId,
        },
      })
      queries.push(q)
    }
  }
  return queries
}

async function createNotifications(customers) {
  const logs = []
  for (const { user } of customers) {
    const count = randInt(1, 5)
    for (let i = 0; i < count; i++) {
      const sent = chance(0.7)
      const log = await prisma.notificationLog.create({
        data: {
          userId: user.id,
          type: sample(['email','sms','push','in_app']),
          channel: sample(['order_update','qc_alert','delivery_reminder','retention_offer']),
          title: 'Synthetic Notification',
          message: 'This is a synthetic notification for testing',
          data: { tag: 'synthetic' },
          sent,
          sentAt: sent ? new Date(Date.now() - randInt(1, 60) * 24*60*60*1000) : null,
          error: sent ? null : 'Mock send error',
        },
      })
      logs.push(log)
    }
  }
  return logs
}

// Minimal env loader for Node scripts (no external deps)
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = fs.existsSync(path.join(process.cwd(), '.env.local'))
    ? path.join(process.cwd(), '.env.local')
    : (fs.existsSync(path.join(process.cwd(), '.env')) ? path.join(process.cwd(), '.env') : null);
  if (envPath) {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    }
  }
} catch (_) {}

function warnEnv() {
  const dbUrl = process.env.DATABASE_URL || ''
  const isProd = process.env.NODE_ENV === 'production'
  if (!dbUrl) {
    console.warn('⚠️ DATABASE_URL not set. Prisma requires a valid connection string.')
  }
  if (isProd) {
    console.warn('⚠️ NODE_ENV is production. Ensure you are not generating synthetic data in a production database!')
  }
  if (dbUrl && dbUrl.includes('postgres')) {
    console.log('🔗 Using PostgreSQL connection:', dbUrl.split('@').pop())
  }
}

function validateSyntheticData({ users, products, subscriptions, qcResults, orders, queries, notifications }, { customers, farmers, weeks }) {
  const counts = {
    customers: users.customers.length,
    farmers: users.farmers.length,
    products: products.length,
    subscriptions: subscriptions.length,
    qcResults: qcResults.length,
    orders: orders.length,
    queries: queries.length,
    notifications: notifications.length,
    weeks,
  }

  const issues = []
  if (counts.customers < Math.floor(customers * 0.9)) issues.push(`Customers below expected: ${counts.customers} < ${Math.floor(customers * 0.9)}`)
  if (counts.farmers < Math.floor(farmers * 0.9)) issues.push(`Farmers below expected: ${counts.farmers} < ${Math.floor(farmers * 0.9)}`)
  if (counts.products < farmers * 3) issues.push(`Products seem low: ${counts.products} < ${farmers * 3}`)
  if (counts.subscriptions < Math.floor(counts.customers * 0.5)) issues.push(`Subscriptions low: ${counts.subscriptions} < ${Math.floor(counts.customers * 0.5)}`)
  if (counts.qcResults < farmers * 8) issues.push(`QC results low: ${counts.qcResults} < ${farmers * 8}`)
  if (counts.orders < weeks * Math.floor(counts.customers * 0.5)) issues.push(`Orders low: ${counts.orders} < ${weeks * Math.floor(counts.customers * 0.5)}`)

  return { counts, issues }
}

async function run() {
  warnEnv()
  const args = parseArgs()
  console.log('🔧 Generating synthetic data with args:', args)

  const users = await ensureUsers({ customers: args.customers, farmers: args.farmers, drivers: args.drivers, admins: args.admins, ops: args.ops })
  console.log(`👥 Users: customers=${users.customers.length}, farmers=${users.farmers.length}`)

  const products = await createProducts(users.farmers)
  console.log(`🛒 Products: ${products.length}`)

  const subscriptions = await createSubscriptions(users.customers, products)
  console.log(`📦 Subscriptions: ${subscriptions.length}`)

  const qcResults = await createFarmerDeliveriesAndQC(users.farmers, products)
  console.log(`✅ QC Results: ${qcResults.length}`)

  const orders = await createOrders(users.customers, products, subscriptions, args.weeks)
  console.log(`🧾 Orders: ${orders.length}`)

  const queries = await createSearchQueries(users.customers, products)
  console.log(`🔍 SearchQueries: ${queries.length}`)

  const notifications = await createNotifications(users.customers)
  console.log(`🔔 Notifications: ${notifications.length}`)

  const { counts, issues } = validateSyntheticData({ users, products, subscriptions, qcResults, orders, queries, notifications }, { customers: args.customers, farmers: args.farmers, weeks: args.weeks })
  console.log('📊 Counts summary:', counts)
  if (args.validate) {
    if (issues.length) {
      console.error('❗ Validation issues detected:')
      for (const i of issues) console.error(' -', i)
      throw new Error('Synthetic data validation failed')
    } else {
      console.log('✅ Validation passed: counts match intended volumes')
    }
  }

  console.log('🎉 Synthetic data generation complete.')
}

run()
  .catch((e) => {
    console.error('❌ Generation failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })