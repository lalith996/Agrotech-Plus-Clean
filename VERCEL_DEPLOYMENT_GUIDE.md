# Vercel Environment Variables Configuration

## Required Environment Variables for Vercel Deployment

Add these to your Vercel project settings (Settings → Environment Variables):

### 1. Database Configuration
```
DATABASE_URL
postgresql://neondb_owner:npg_nc8r3kCVZJHN@ep-square-firefly-adixt039-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. NextAuth Secret
```
NEXTAUTH_SECRET
0EJQn1OlEHnz12UAbUYcKtemOjchw4ZXxfBWEbawpyU=
```

### 3. NextAuth URL
```
NEXTAUTH_URL
https://your-deployment-url.vercel.app
```
(Update this after your first deployment with the actual Vercel URL)

### 4. Node Environment
```
NODE_ENV
production
```

## Optional Environment Variables

### Gemini AI (for chatbot feature)
```
GEMINI_API_KEY
your-gemini-api-key

GEMINI_MODEL
models/gemini-1.5-flash
```

### Google OAuth (for social login)
```
GOOGLE_CLIENT_ID
your-google-client-id

GOOGLE_CLIENT_SECRET
your-google-client-secret
```

## Database Status ✅

Your Neon database is fully configured with:
- ✅ All 30 tables created
- ✅ All foreign key relationships established
- ✅ Demo accounts seeded (23 users total):
  - 16 Customers
  - 2 Farmers
  - 2 Operations users
  - 2 Admins
  - 1 Driver

### Demo Account Credentials
- Customer: customer@demo.com / demo123
- Farmer: farmer@demo.com / demo123
- Admin: admin@demo.com / admin123
- Driver: driver@demo.com / demo123
- Operations: operations@demo.com / demo123

## Next Steps

1. Go to https://vercel.com/dashboard
2. Open your "Agrotech-Plus-Clean" project
3. Go to Settings → Environment Variables
4. Add all required variables above
5. Go to Deployments tab
6. Click "Redeploy" on the latest deployment
7. Once deployed, update NEXTAUTH_URL with your actual Vercel URL
8. Redeploy again for the updated URL to take effect

## Database Connection Verified ✅

All tables and relationships have been verified:
- users → customers (1:1)
- users → farmers (1:1)
- customers → orders (1:many)
- farmers → products (1:many)
- customers → subscriptions (1:many)
- orders → order_items (1:many)

Your database is production-ready!
