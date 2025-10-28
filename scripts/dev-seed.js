#!/usr/bin/env node
/*
 * Dev seed: creates credential users for local login (ADMIN and OPERATIONS).
 * Safe to run multiple times; uses upsert by email.
 */

// Minimal env loader: .env.local > .env
const fs = require('fs');
const path = require('path');
(function loadEnv() {
  const root = process.cwd();
  const candidates = ['.env.local', '.env'];
  for (const f of candidates) {
    const p = path.join(root, f);
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const key = m[1];
        let val = m[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
      break;
    }
  }
})();

const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function ensureUser({ email, name, role, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash, emailVerified: new Date() },
  });
  return user;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Please configure .env.local or .env');
    process.exit(1);
  }

  console.log('Connecting to database...');

  const admin = await ensureUser({
    email: 'admin@local.test',
    name: 'Admin User',
    role: UserRole.ADMIN,
    password: 'admin123!',
  });

  const ops = await ensureUser({
    email: 'ops@local.test',
    name: 'Operations User',
    role: UserRole.OPERATIONS,
    password: 'ops123!',
  });

  console.log('Seed complete. You can sign in with:');
  console.log('  ADMIN:    email=admin@local.test  password=admin123!');
  console.log('  OPERATIONS: email=ops@local.test    password=ops123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });