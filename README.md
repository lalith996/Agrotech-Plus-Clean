# AgroTrack+ 🌱

A comprehensive farm-to-table subscription platform connecting consumers directly with local farmers in Bengaluru, Karnataka. Built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### Customer Portal
- **Secure Authentication**: Role-based access control for customers, farmers, and admins
- **Product Catalog**: Browse fresh produce with transparent "Trust Statement" pricing
- **Subscription Management**: Create, modify, pause, and cancel weekly produce subscriptions
- **Order Tracking**: Complete order history with real-time status updates
- **Delivery Scheduling**: Zone-based delivery with flexible time slots

### Farmer Portal
- **Profile Management**: Farm details, certifications, and document uploads
- **Product Listings**: Manage product catalog with pricing and availability
- **Delivery Requirements**: View upcoming delivery obligations and requirements
- **Quality Insights**: Performance analytics with QC results and recommendations
- **Revenue Tracking**: Earnings overview and payment history

### Admin Dashboard
- **Farmer Management**: Approve and manage farmer partnerships
- **Procurement System**: Generate daily procurement lists from subscription orders
- **Delivery Zones**: Configure delivery areas and time slots
- **Quality Control**: Monitor QC results and maintain quality standards
- **Analytics**: Platform metrics and operational insights

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling with Modern Organic design system
- **Radix UI** components for accessible, customizable UI
- **React Hook Form** with Zod validation
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend
- **Next.js API Routes** for serverless backend
- **Prisma ORM** with PostgreSQL database
- **NextAuth.js** for authentication and session management
- **Zod** for runtime type validation

### Database
- **PostgreSQL** with comprehensive schema for all entities
- **Prisma** for type-safe database operations
- **Role-based data access** with proper relationships

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │     Farmer      │    │     Admin       │
│   Portal        │    │     Portal      │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Next.js API Layer                  │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
         │  │    Auth     │  │  Business   │  │   Data  │ │
         │  │ Middleware  │  │    Logic    │  │ Access  │ │
         │  └─────────────┘  └─────────────┘  └─────────┘ │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              PostgreSQL Database                │
         │  Users | Farmers | Products | Subscriptions    │
         │  Orders | QC Results | Delivery Routes         │
         └─────────────────────────────────────────────────┘
```

## 🎨 Design System

### Modern Organic Theme
- **Primary Colors**: Deep forest green (#2D5016), warm earth brown (#8B4513)
- **Accent Color**: Fresh carrot orange (#FF6B35)
- **Typography**: Inter (UI), Lora (storytelling)
- **Visual Elements**: Soft rounded corners, organic shadows, agricultural imagery

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agrotrack-plus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/agrotrack"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Entities
- **Users**: Authentication and role management
- **Customers**: Customer profiles and addresses
- **Farmers**: Farm details and certifications
- **Products**: Product catalog with pricing
- **Subscriptions**: Customer subscription management
- **Orders**: Order processing and fulfillment
- **QC Results**: Quality control tracking
- **Delivery Routes**: Logistics and route planning

## 🔐 Authentication & Authorization

### User Roles
- **CUSTOMER**: Browse products, manage subscriptions, track orders
- **FARMER**: Manage products, view delivery requirements, track performance
- **OPERATIONS**: Manage procurement, quality control, logistics
- **ADMIN**: Full system access, farmer approval, configuration

### Security Features
- JWT-based session management
- Role-based access control (RBAC)
- Input validation and sanitization
- Secure password handling
- Protected API routes

## 📱 Key Features Implemented

### ✅ Completed Features
1. **Project Foundation** - Next.js 14 setup with TypeScript and Tailwind
2. **Database Schema** - Comprehensive Prisma schema with all entities
3. **Authentication System** - NextAuth.js with role-based access
4. **Product Catalog** - Browse products with trust statement pricing
5. **Subscription Management** - Create and manage weekly subscriptions
6. **Delivery Zones** - Geographic delivery areas with time slots
7. **Order Management** - Complete order lifecycle with status tracking
8. **Farmer Portal** - Dashboard, products, deliveries, and insights
9. **Admin Systems** - Farmer management and procurement tools
10. **Notifications** - Email and in-app notification system
11. **Error Handling** - Comprehensive error boundaries and user feedback

### 🚧 Remaining Tasks
- Quality Control tablet interface
- Route planning and logistics optimization
- File upload and storage system
- Advanced reporting and analytics
- Search and filtering enhancements
- Performance optimization and caching
- Security hardening
- Mobile responsiveness improvements
- Admin configuration system
- Integration testing

## 🚀 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to Vercel or similar platform

### Production Considerations
- Database connection pooling
- Redis caching for performance
- CDN for static assets
- Error monitoring (Sentry)
- Analytics tracking
- SSL/TLS encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Local farmers in Bengaluru for inspiration
- Open source community for amazing tools
- Sustainable agriculture advocates

---

**AgroTrack+** - Connecting communities through fresh, local produce 🌱