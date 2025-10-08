# AgroTrack+ - Farm-to-Table Subscription Platform

## Overview

AgroTrack+ is a comprehensive farm-to-table subscription platform built with Next.js 14, TypeScript, and modern web technologies. It connects consumers directly with local farmers in Bengaluru, Karnataka, providing transparent pricing, subscription management, and complete supply chain traceability from farm to doorstep.

The platform serves four main user types:
- **Customers**: Browse products, manage subscriptions, track orders
- **Farmers**: Manage farm profiles, list products, track deliveries and quality metrics
- **Operations/Admin**: Manage farmers, configure delivery zones, oversee quality control
- **Drivers**: Handle delivery routes and logistics

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 2025 - Vercel to Replit Migration & UI Upgrade
- ✅ Successfully migrated from Vercel to Replit environment
- ✅ Updated Next.js configuration for Replit compatibility (port 5000, allowedDevOrigins)
- ✅ Configured environment variables and security settings
- ✅ Set up deployment configuration for production (autoscale target)
- ✅ UI redesigned with Ecobazar-inspired organic eCommerce aesthetic
- ✅ Updated color palette to fresh organic green (#00B207) with earth tone accents
- ✅ Added Poppins typography for modern, clean look
- ✅ Enhanced homepage with hero section, feature cards, categories, and testimonials
- ✅ Fixed Content Security Policy to allow Google Fonts
- ✅ All components updated with rounded corners, soft shadows, and smooth animations

## System Architecture

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router for server-side rendering and optimal performance
- TypeScript for type safety across the entire application
- Pages directory structure with role-based dashboards (`/dashboard`, `/farmer/dashboard`, `/admin/dashboard`)

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS with custom design system ("Ecobazar Organic" color palette)
- Custom theme: organic green (#00B207) as primary brand color, earth tones for secondary elements
- Framer Motion for animations and transitions with reduced motion support
- Responsive design with mobile-first approach

**State Management**
- Zustand stores for global state (user, theme, notifications)
- React Hook Form with Zod validation for form handling
- TanStack Query for server state management and caching

**Key Design Patterns**
- Glass-morphism cards with shadow-glow effects
- Parallax scrolling containers for hero sections
- Animated numbers and reveal animations for engagement
- Accessibility-first with ARIA labels, keyboard navigation, and screen reader support

### Backend Architecture

**API Layer**
- Next.js API Routes for serverless backend functions
- RESTful endpoints organized by feature (`/api/products`, `/api/orders`, etc.)
- NextAuth.js for authentication with JWT strategy and credential provider

**Data Access**
- Prisma ORM as the database abstraction layer
- Type-safe database queries with generated Prisma Client
- Relationship-based data modeling (User → Customer/Farmer, Subscription → Orders, etc.)

**Business Logic Services**
- File upload service with AWS S3 integration and image optimization (Sharp)
- Document management with versioning and approval workflows
- Quality Control (QC) offline storage using IndexedDB for tablet inspections
- Route optimization algorithms for delivery efficiency
- OCR service (Tesseract.js) for certificate scanning and data extraction
- Personalization engine for product recommendations

**Caching Strategy**
- Two-tier caching: In-memory (NodeCache) + Redis for distributed caching
- Query result caching with configurable TTL
- Performance monitoring and slow query detection
- Cache invalidation on data mutations

### Database Design

**Core Entities**
- Users (with role-based access: CUSTOMER, FARMER, OPERATIONS, ADMIN, DRIVER)
- Customers (linked to Users, with addresses and subscriptions)
- Farmers (farm profiles, certifications, products)
- Products (catalog with pricing, images, availability)
- Subscriptions (weekly delivery plans with items)
- Orders (generated from subscriptions, with status tracking)
- QC Results (quality control inspections with photo evidence)
- Delivery Zones (geographic areas with time slots)

**Key Relationships**
- One-to-One: User → Customer/Farmer
- One-to-Many: Customer → Addresses, Farmer → Products
- Many-to-Many: Subscriptions → Products (via SubscriptionItems)
- Cascading deletes for data integrity

**Data Validation**
- Zod schemas for runtime validation
- Prisma schema constraints for database-level validation
- Indian-specific formats (6-digit ZIP codes, +91 phone numbers)

### Authentication & Security

**Authentication Flow**
- NextAuth.js with Prisma adapter for session management
- Credential-based authentication with bcrypt password hashing
- JWT tokens for stateless sessions
- Role-based access control (RBAC) middleware

**Security Measures**
- Input sanitization (HTML, SQL injection prevention)
- Rate limiting on API routes (100 requests per 15-minute window)
- Security headers (CSP, HSTS, X-Frame-Options, XSS Protection)
- File upload validation (type checking, size limits, malware scanning)
- CORS configuration for allowed origins
- Data encryption for sensitive information

### Performance Optimization

**Frontend Performance**
- Code splitting and lazy loading
- Image optimization with Next.js Image component (WebP/AVIF formats)
- Font optimization with Google Fonts preconnect
- Bundle optimization (tree shaking, minification)
- Service Worker for offline functionality and asset caching

**Backend Performance**
- Database connection pooling with Prisma
- Query optimization with indexes and selective field loading
- API response compression
- CDN integration for static assets (AWS S3)
- Performance metrics collection and monitoring

**Progressive Web App (PWA)**
- Service worker for offline-first experience
- Manifest.json for installable app
- Offline page fallback
- Background sync for QC data when connection restored

## External Dependencies

### Third-Party Services

**Cloud Infrastructure**
- AWS S3: File storage for product images, farmer certifications, QC photos
- AWS SDK: S3 operations, thumbnail generation, signed URLs

**Authentication & Database**
- PostgreSQL: Primary relational database (via Prisma)
- Redis/ioredis: Distributed caching and rate limiting
- NextAuth.js: Authentication and session management

**Email & SMS (Configured, Not Implemented)**
- SendGrid: Email notifications (API key in environment)
- Twilio: SMS notifications (account SID and auth token configured)

**Payment Processing (Configured, Not Implemented)**
- Stripe: Payment gateway for subscriptions and orders

**Maps & Routing**
- Google Maps API (mock service in codebase): Route optimization, geocoding, delivery tracking
- Custom route optimization algorithms with traffic and weather considerations

**Image Processing**
- Sharp: Server-side image optimization, thumbnail generation, watermarking
- Tesseract.js: OCR for scanning farmer certifications

**UI Libraries**
- Radix UI: Accessible component primitives (Dialog, Dropdown, Toast, etc.)
- Recharts: Data visualization for analytics dashboards
- Lucide React / Heroicons: Icon libraries
- Embla Carousel: Image carousels
- Sonner: Toast notifications

**Development & Testing**
- Vitest: Unit testing framework with jsdom environment
- ESLint: Code linting with Next.js rules
- TypeScript: Static type checking

**Monitoring & Analytics**
- Custom performance metrics collection
- Query performance monitoring
- Error tracking and logging

### Environment Configuration

**Required Environment Variables**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT signing secret
- `NEXTAUTH_URL`: Application base URL
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`: AWS S3 configuration
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Redis configuration
- `SENDGRID_API_KEY`: Email service
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: SMS service
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`: Payment processing

**Development Tools**
- Prisma CLI for database migrations (`npx prisma db push`)
- Seed script for sample data (`npm run db:seed`)
- Development server on port 5000 with hot reload