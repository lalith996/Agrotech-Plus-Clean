/*
 Standalone Synthetic Data Validation Script
 - Verifies volumes and distributions for key entities without generating data.
 - Usage:
   DATABASE_URL=postgres://... node scripts/validate-synthetic-data.js [--minCustomers=80] [--minFarmers=10] [--weeks=12] [--minOrdersPerCustomerPerWeek=0.5]
*/

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

function parseArgs() {
  const defaults = {
    minCustomers: 80,
    minFarmers: 10,
    weeks: 12,
    minOrdersPerCustomerPerWeek: 0.5,
  }
  const args = { ...defaults }
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue
    const [k,v] = arg.slice(2).split('=')
    if (k in defaults) {
      args[k] = k === 'weeks' ? parseInt(v, 10) : parseFloat(v)
    }
  }
  return args
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay() || 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  d.setHours(0,0,0,0)
  return d
}
function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d }

async function validate(args) {
  const issues = []

  const customers = await prisma.customer.count()
  const farmers = await prisma.farmer.count()
  const products = await prisma.product.count()
  const subs = await prisma.subscription.count()
  const qcCount = await prisma.qCResult.count()

  const end = startOfWeek(new Date())
  const start = addDays(end, -7 * args.weeks)
  const orders = await prisma.order.count({ where: { deliveryDate: { gte: start, lt: addDays(end, 7) } } })

  if (customers < args.minCustomers) issues.push(`Customers below min: ${customers} < ${args.minCustomers}`)
  if (farmers < args.minFarmers) issues.push(`Farmers below min: ${farmers} < ${args.minFarmers}`)
  if (products < farmers * 3) issues.push(`Products per farmer low: ${products} < ${farmers * 3}`)
  if (subs < Math.floor(customers * 0.5)) issues.push(`Subscriptions low: ${subs} < ${Math.floor(customers * 0.5)}`)
  if (qcCount < farmers * 8) issues.push(`QC results low: ${qcCount} < ${farmers * 8}`)

  const ordersPerCustomerPerWeek = customers > 0 && args.weeks > 0 ? orders / customers / args.weeks : 0
  if (ordersPerCustomerPerWeek < args.minOrdersPerCustomerPerWeek) issues.push(`Orders/customer/week low: ${ordersPerCustomerPerWeek.toFixed(2)} < ${args.minOrdersPerCustomerPerWeek}`)

  return { counts: { customers, farmers, products, subs, qcCount, orders, weeks: args.weeks, ordersPerCustomerPerWeek: Number(ordersPerCustomerPerWeek.toFixed(2)) }, issues }
}

async function run() {
  const args = parseArgs()
  console.log('🔍 Validating synthetic data with thresholds:', args)
  const { counts, issues } = await validate(args)
  console.log('📊 Counts:', counts)
  if (issues.length) {
    console.error('❗ Issues:')
    for (const i of issues) console.error(' -', i)
    process.exit(2)
  } else {
    console.log('✅ Validation passed')
  }
}

run().catch((e) => {
  console.error('❌ Validation script failed:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})