# AgroTech+ Clean Version 🌾

**A modern agricultural platform without external API dependencies**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10.2-brightgreen)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

This is a **clean version** of the AgroTech+ platform with all external API dependencies removed. Perfect for local development, testing, and learning without requiring third-party service credentials.

### What's Been Removed?

This version has been cleaned of the following external dependencies:
- ❌ **SendGrid** - Email notifications (replaced with console logging)
- ❌ **Twilio** - SMS notifications (replaced with console logging)
- ❌ **AWS S3** - Cloud file storage (can be replaced with local storage)
- ❌ **Google Maps** - Maps and geocoding APIs
- ❌ **Stripe** - Payment processing
- ❌ **Firebase** - Cloud services

All notification functionality has been replaced with detailed console logging, allowing you to see what would have been sent without needing API keys.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lalith996/Agrotech-Plus-Clean.git
   cd Agrotech-Plus-Clean
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/agrotech"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎭 Demo Accounts

After seeding, you can log in with these accounts:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Customer | customer@demo.com | demo123 | `/dashboard` |
| Farmer | farmer@demo.com | demo123 | `/farmer/dashboard` |
| Operations | operations@demo.com | demo123 | `/operations/dashboard` |
| Driver | driver@demo.com | demo123 | `/driver/dashboard` |
| Admin | admin@demo.com | admin123 | `/admin/dashboard` |

## 📁 Project Structure

```
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── admin/         # Admin panel pages
│   ├── farmer/        # Farmer dashboard
│   ├── customer/      # Customer portal
│   ├── driver/        # Driver interface
│   └── operations/    # Operations dashboard
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── charts/       # Data visualization
│   └── layout/       # Layout components
├── lib/              # Utility functions and services
│   ├── prisma.ts    # Database client
│   ├── auth.ts      # Authentication config
│   └── utils.ts     # Helper functions
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── styles/           # Global styles
```

## 🔧 Key Features

### Role-Based Access Control
- **5 distinct user roles**: Customer, Farmer, Operations, Driver, Admin
- Protected routes with middleware
- Role-specific dashboards and features

### Core Functionality
- ✅ User authentication with NextAuth.js
- ✅ Product catalog and management
- ✅ Order processing and tracking
- ✅ Quality control workflows
- ✅ Farmer certification management
- ✅ Dashboard analytics
- ✅ Real-time order status updates

### Developer Features
- ✅ TypeScript throughout
- ✅ Prisma ORM for database
- ✅ Console logging for notifications
- ✅ No external API requirements
- ✅ Easy local development setup

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test            # Run tests
```

### Database Management

```bash
npx prisma studio              # Open Prisma Studio
npx prisma db push             # Push schema to database
npx prisma generate            # Generate Prisma Client
npx prisma db seed             # Seed demo data
```

## 📝 Notification System

All notifications (email/SMS) are logged to the console instead of being sent:

```typescript
// Example console output
[Registration] Admin notification created for farmer: {
  farmerName: 'John Doe',
  farmerEmail: 'john@example.com',
  farmName: 'Green Valley Farm',
  adminEmail: 'admin@demo.com'
}
```

## 🐛 Recent Fixes

This clean version includes the following fixes:
- ✅ Removed all external API library files
- ✅ Updated all API endpoints to use console logging
- ✅ Cleaned up package.json dependencies
- ✅ Fixed dashboard 403 errors with enhanced role checking
- ✅ Removed unused imports and function calls

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://www.prisma.io/)
- Authentication with [NextAuth.js](https://next-auth.js.org/)

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note**: This is a development/learning version with external dependencies removed. For production use, consider implementing proper email, SMS, and cloud storage services.
