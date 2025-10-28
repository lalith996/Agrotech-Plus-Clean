# Design Document

## Overview

This design document outlines the architecture for implementing a comprehensive role-based access control system with AI/ML features for AgroTrack+. The system provides distinct portals for five user roles (Customer, Farmer, Admin, Operations, Driver) with auto-generated email addresses and role-specific functionality.

### Key Design Principles

1. **Security First**: Multi-layer security with middleware, API route protection, and component-level access control
2. **Minimal Implementation**: Focus on core features that provide immediate business value
3. **Scalable Architecture**: Design supports future AI/ML enhancements without major refactoring
4. **User Experience**: Role-specific dashboards with relevant widgets and quick actions
5. **Performance**: Optimized data fetching with caching and efficient database queries

### System Boundaries

- **In Scope**: Email generation, role-based access control, authentication, authorization, core AI/ML features (recommendations, forecasting, scoring, search, route optimization)
- **Out of Scope**: Advanced AI/ML features (visual search, voice assistant), third-party integrations beyond existing services, mobile app development

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Customer │  │  Farmer  │  │  Admin   │  │  Driver  │   │
│  │  Portal  │  │  Portal  │  │  Portal  │  │  Portal  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware Layer                          │
│  • Authentication Check                                      │
│  • Role-Based Authorization                                  │
│  • Rate Limiting                                             │
│  • Security Headers                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Next.js API │  │  Auth System │  │  ML Service  │     │
│  │    Routes    │  │  (NextAuth)  │  │   (Python)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │   S3/Cloud   │     │
│  │   (Prisma)   │  │   (Cache)    │  │   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis (for session storage and ML predictions)
- **ML Service**: Python (FastAPI, scikit-learn, TensorFlow)
- **Authentication**: NextAuth.js with JWT strategy
- **File Storage**: AWS S3 or compatible cloud storage


## Components and Interfaces

### 1. Email Generation System

#### Email Generator Service (`lib/email-generator.ts`)

```typescript
interface EmailGeneratorConfig {
  supportedCities: string[]
  roleEmailDomains: Record<UserRole, string>
}

interface GeneratedEmail {
  email: string
  city: string
  normalizedName: string
  registrationNumber: string
  role: UserRole
}

class EmailGenerator {
  async generateEmail(
    name: string, 
    city: string, 
    role: UserRole
  ): Promise<GeneratedEmail>
  
  async getNextRegistrationNumber(
    city: string, 
    role: UserRole
  ): Promise<string>
  
  parseEmail(email: string): ParsedEmail | null
}
```

**Key Responsibilities:**
- Normalize user name (remove spaces, convert to lowercase)
- Validate city against supported list
- Query/update EmailRegistry for registration numbers
- Generate email in format: `{city}.{name}.{regNum}@{role}.agrotrack.com`
- Parse existing emails to extract components

**Database Schema:**
- Uses existing `EmailRegistry` model with `city`, `role`, `count` fields
- Atomic increment operations to prevent duplicate registration numbers


### 2. Role-Based Access Control System

#### Access Control Service (`lib/role-access-control.ts`)

```typescript
interface RolePermissions {
  allowedRoutes: string[]
  allowedApiEndpoints: string[]
  dashboardPath: string
}

interface AccessControlConfig {
  rolePermissions: Record<UserRole, RolePermissions>
}

class RoleAccessControl {
  canAccessRoute(role: UserRole, path: string): boolean
  canAccessApi(role: UserRole, endpoint: string): boolean
  getDashboardPath(role: UserRole): string
  getNavigationItems(role: UserRole): NavigationItem[]
}
```

**Route Access Matrix:**

| Role | Allowed Routes | Blocked Routes | Dashboard |
|------|---------------|----------------|-----------|
| CUSTOMER | /, /products, /cart, /checkout, /orders, /subscriptions, /profile, /wishlist, /dashboard | /farmer/*, /admin/*, /driver/* | /dashboard |
| FARMER | /, /farmer/*, /profile | /admin/*, /driver/*, /cart, /checkout | /farmer/dashboard |
| ADMIN | /, /admin/*, /profile | /farmer/*, /driver/*, /cart | /admin/dashboard |
| OPERATIONS | /, /admin/dashboard, /admin/procurement, /admin/qc, /admin/logistics, /admin/analytics, /profile | /admin/farmers, /admin/users, /admin/settings, /farmer/*, /driver/* | /admin/dashboard |
| DRIVER | /, /driver/*, /profile | /admin/*, /farmer/*, /products, /cart | /driver/dashboard |

**API Access Matrix:**

| Role | Allowed API Patterns | Examples |
|------|---------------------|----------|
| CUSTOMER | /api/products/*, /api/orders/*, /api/subscriptions/*, /api/personalization/* | GET /api/products, POST /api/orders |
| FARMER | /api/farmer/*, /api/certifications/*, /api/products/* (own) | GET /api/farmer/dashboard, POST /api/farmer/products |
| ADMIN | /api/admin/*, /api/farmer/* (view), /api/search/* | GET /api/admin/farmers, POST /api/admin/users |
| OPERATIONS | /api/admin/procurement/*, /api/admin/qc/*, /api/admin/logistics/* | POST /api/admin/procurement/generate |
| DRIVER | /api/driver/*, /api/orders/* (assigned) | GET /api/driver/deliveries, PUT /api/orders/[id]/status |


### 3. Authentication System

#### Enhanced NextAuth Configuration

**Session Strategy:**
- JWT-based sessions (existing implementation)
- Role information stored in JWT token
- Session includes: `id`, `email`, `name`, `role`

**Authentication Flow:**

```
1. User Registration
   ├─> Generate email (EmailGenerator)
   ├─> Hash password (bcrypt)
   ├─> Create User record
   ├─> Create role-specific profile (Customer/Farmer/etc.)
   └─> Send welcome email

2. User Login
   ├─> Validate credentials
   ├─> Create JWT with role
   ├─> Set session cookie
   └─> Redirect to role dashboard

3. Session Validation (on each request)
   ├─> Verify JWT signature
   ├─> Check expiration
   ├─> Extract role
   └─> Authorize access
```

**Farmer Approval Flow:**

```
1. Farmer Registration
   ├─> Create User with role=FARMER
   ├─> Create Farmer profile with isApproved=false
   ├─> Send notification to admins
   └─> Show "Pending Approval" message

2. Admin Approval
   ├─> Admin reviews application
   ├─> Admin clicks Approve/Reject
   ├─> Update Farmer.isApproved
   ├─> Send email to farmer
   └─> Farmer gains full access

3. Access Control
   ├─> Check session.user.role === 'FARMER'
   ├─> Query Farmer.isApproved
   └─> Show limited/full features
```


### 4. Middleware Protection Layer

#### Enhanced Middleware (`middleware.ts`)

**Responsibilities:**
1. Security headers (existing)
2. Rate limiting (existing)
3. Authentication check (enhanced)
4. Role-based authorization (new)
5. CSRF protection (existing)

**Authorization Logic:**

```typescript
// Pseudo-code for middleware authorization
async function authorizeRequest(request: NextRequest) {
  const token = await getToken({ req: request })
  
  if (!token) {
    return redirectToSignIn()
  }
  
  const path = request.nextUrl.pathname
  const role = token.role as UserRole
  
  // Check if role can access path
  if (!roleAccessControl.canAccessRoute(role, path)) {
    const dashboardPath = roleAccessControl.getDashboardPath(role)
    return redirect(dashboardPath)
  }
  
  return NextResponse.next()
}
```

**Protected Path Patterns:**
- `/dashboard` - All authenticated users
- `/profile` - All authenticated users
- `/farmer/*` - FARMER role only
- `/admin/*` - ADMIN and OPERATIONS roles (with sub-restrictions)
- `/driver/*` - DRIVER role only
- `/cart`, `/checkout` - CUSTOMER role only


### 5. Component-Level Access Control

#### RoleBasedLayout Component

```typescript
interface RoleBasedLayoutProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
}

// Usage example
<RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
  <AdminContent />
</RoleBasedLayout>
```

**Behavior:**
- Checks session.user.role against allowedRoles
- If authorized: renders children
- If unauthorized: redirects to fallbackPath or role dashboard
- Shows loading state during session check

#### RoleBasedHeader Component

```typescript
interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType
  roles: UserRole[]
}

// Component generates navigation based on user role
const navigationConfig: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['CUSTOMER'] },
  { label: 'Products', href: '/products', roles: ['CUSTOMER'] },
  { label: 'My Products', href: '/farmer/products', roles: ['FARMER'] },
  { label: 'Farmers', href: '/admin/farmers', roles: ['ADMIN'] },
  // ... more items
]
```

**Features:**
- Filters navigation items by user role
- Highlights active route
- Shows user email with parsed components
- Role badge with color coding
- Logout functionality


### 6. Dashboard System

#### Dashboard Architecture

Each role has a dedicated dashboard with role-specific widgets:

**Customer Dashboard (`/dashboard`)**
```typescript
interface CustomerDashboardData {
  activeSubscriptions: number
  recentOrders: Order[]
  wishlistItems: Product[]
  recommendedProducts: Product[]
  nextDelivery: { date: Date; items: number }
  carbonFootprint: number
}
```

Widgets:
- Active Subscriptions Count
- Recent Orders Timeline (last 5)
- Wishlist Items (with quick add to cart)
- Recommended Products (AI-powered)
- Next Delivery Schedule
- Carbon Footprint Tracker

**Farmer Dashboard (`/farmer/dashboard`)**
```typescript
interface FarmerDashboardData {
  upcomingDeliveries: FarmerDelivery[]
  demandForecast: { product: string; quantity: number; date: Date }[]
  qualityScoreTrend: { date: Date; score: number }[]
  revenueAnalytics: { period: string; revenue: number }[]
  alerts: Alert[]
}
```

Widgets:
- Upcoming Deliveries (next 7 days)
- Demand Forecast (AI-powered)
- Quality Score Trend Chart
- Revenue Analytics
- Product Performance Table
- Alerts & Notifications

**Admin Dashboard (`/admin/dashboard`)**
```typescript
interface AdminDashboardData {
  platformMetrics: { gmv: number; orders: number; users: number }
  pendingFarmers: Farmer[]
  procurementList: ProcurementItem[]
  qualityAlerts: QCResult[]
  revenueForecast: { date: Date; forecast: number }[]
}
```

Widgets:
- Platform Metrics (GMV, Orders, Users)
- Pending Farmer Approvals
- Daily Procurement List
- Quality Alerts
- Revenue Forecast (AI-powered)
- System Health Monitor

**Operations Dashboard (`/admin/dashboard` with limited access)**
```typescript
interface OperationsDashboardData {
  procurementList: ProcurementItem[]
  qualityAlerts: QCResult[]
  activeRoutes: DeliveryRoute[]
  inventoryStatus: { product: string; stock: number; status: string }[]
}
```

Widgets:
- Daily Procurement List
- Quality Alerts
- Active Delivery Routes
- Inventory Status
- Operational Metrics

**Driver Dashboard (`/driver/dashboard`)**
```typescript
interface DriverDashboardData {
  todaysDeliveries: Order[]
  activeRoute: DeliveryRoute
  performance: { successRate: number; avgTime: number }
  earnings: { today: number; week: number }
}
```

Widgets:
- Today's Deliveries List
- Active Route Map
- Delivery Performance Stats
- Today's Earnings
- Navigation Assistance


## Data Models

### Enhanced User Model

The existing User model already includes the necessary fields:
- `city`: String (for email generation)
- `registrationNumber`: String (auto-generated)
- `role`: UserRole enum
- `passwordHash`: String (for credentials authentication)

### EmailRegistry Model

Already exists in schema:
```prisma
model EmailRegistry {
  id        String   @id @default(cuid())
  city      String
  role      UserRole
  count     Int      @default(0)
  
  @@unique([city, role])
}
```

**Operations:**
- `findUnique({ where: { city_role: { city, role } } })` - Get current count
- `upsert()` with atomic increment - Ensure no duplicate registration numbers
- Transaction-based updates for consistency

### Role-Specific Profile Models

Already exist in schema:
- `Customer` - Links to User, stores addresses, subscriptions, orders
- `Farmer` - Links to User, includes `isApproved` field for approval workflow
- No separate models needed for Admin, Operations, Driver (role stored in User)

### Session Enhancement

NextAuth JWT token includes:
```typescript
interface ExtendedJWT {
  sub: string // user id
  email: string
  name: string
  role: UserRole // Added in callbacks
}
```


## AI/ML Integration Architecture

### ML Service Design

**Deployment Model:**
- Separate Python service (FastAPI) for ML operations
- Next.js API routes act as proxy/gateway
- Redis cache for predictions to reduce latency
- Async training jobs using Celery (future enhancement)

**ML Service Endpoints:**

```
POST /ml/recommendations
  Input: { userId, context, limit }
  Output: { products: Product[], confidence: number }

POST /ml/demand-forecast
  Input: { farmerId, productIds, days }
  Output: { forecasts: Forecast[], accuracy: number }

POST /ml/farmer-score
  Input: { farmerId, certifications, documents }
  Output: { score: number, factors: ScoringFactor[] }

POST /ml/search
  Input: { query, filters, userId }
  Output: { results: Product[], suggestions: string[] }

POST /ml/route-optimize
  Input: { orders: Order[], constraints }
  Output: { route: OptimizedRoute, savings: number }
```

### Priority AI/ML Features (Phase 1)

#### 1. Product Recommendations

**Algorithm:** Collaborative Filtering + Content-Based
**Training Data:** orders, orderItems, userPreferences
**Update Frequency:** Daily batch training
**Latency Target:** < 200ms (with caching)

**Implementation:**
```typescript
// API Route: /api/personalization/recommendations
async function getRecommendations(userId: string) {
  // Check cache first
  const cached = await redis.get(`recommendations:${userId}`)
  if (cached) return JSON.parse(cached)
  
  // Call ML service
  const recommendations = await mlClient.post('/ml/recommendations', {
    userId,
    limit: 10
  })
  
  // Cache for 1 hour
  await redis.setex(`recommendations:${userId}`, 3600, 
    JSON.stringify(recommendations))
  
  return recommendations
}
```

**Fallback Strategy:**
- If ML service unavailable: show trending products
- If insufficient data: show popular products in user's city
- Always return results (never fail)


#### 2. Demand Forecasting

**Algorithm:** Time Series (Prophet or LSTM)
**Training Data:** orders, orderItems, subscriptions (6+ months)
**Update Frequency:** Weekly retraining, daily predictions
**Latency Target:** < 500ms

**Implementation:**
```typescript
// API Route: /api/farmer/demand-forecast
async function getDemandForecast(farmerId: string) {
  const cacheKey = `forecast:${farmerId}:${today}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)
  
  // Get farmer's products
  const products = await prisma.product.findMany({
    where: { farmerId }
  })
  
  // Call ML service
  const forecast = await mlClient.post('/ml/demand-forecast', {
    farmerId,
    productIds: products.map(p => p.id),
    days: 7
  })
  
  // Cache until end of day
  await redis.setex(cacheKey, 86400, JSON.stringify(forecast))
  
  return forecast
}
```

**Fallback Strategy:**
- Use moving average of last 4 weeks
- Show historical demand patterns
- Display confidence intervals

#### 3. Farmer Approval Scoring

**Algorithm:** Classification (Random Forest or XGBoost)
**Training Data:** farmers, certifications, historical approval decisions
**Update Frequency:** Monthly retraining
**Latency Target:** < 1s (one-time per application)

**Scoring Factors:**
- Certification validity (40%)
- Document authenticity (30%)
- Location verification (15%)
- Contact information completeness (15%)

**Implementation:**
```typescript
// API Route: /api/admin/farmers/score
async function scoreFarmerApplication(farmerId: string) {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { certifications: true, user: true }
  })
  
  // Call ML service
  const score = await mlClient.post('/ml/farmer-score', {
    farmerId,
    certifications: farmer.certifications,
    location: farmer.location,
    phone: farmer.phone
  })
  
  return score
}
```

**Score Interpretation:**
- 80-100: Auto-approve (with admin notification)
- 50-79: Manual review required
- 0-49: Flag for detailed investigation


#### 4. Smart Search

**Algorithm:** Elasticsearch with NLP preprocessing
**Training Data:** searchQueries, products, click-through data
**Update Frequency:** Real-time indexing, weekly ranking updates
**Latency Target:** < 300ms

**Features:**
- Natural language processing
- Fuzzy matching (typo tolerance)
- Auto-complete suggestions
- Personalized ranking

**Implementation:**
```typescript
// API Route: /api/search/products
async function searchProducts(query: string, userId?: string) {
  // Call ML service for NLP processing
  const processed = await mlClient.post('/ml/search', {
    query,
    userId,
    filters: {}
  })
  
  // Track search query
  await prisma.searchQuery.create({
    data: {
      query,
      userId,
      results: processed.results.length
    }
  })
  
  return processed
}
```

**Ranking Factors:**
- Text relevance (50%)
- User preferences (20%)
- Product popularity (15%)
- Farmer quality score (15%)

#### 5. Route Optimization

**Algorithm:** Genetic Algorithm or Ant Colony Optimization
**Training Data:** deliveryRoutes, orders, addresses
**Update Frequency:** Real-time on route creation
**Latency Target:** < 2s for 50 stops

**Constraints:**
- Delivery time windows
- Vehicle capacity
- Driver working hours
- Traffic conditions (via external API)

**Implementation:**
```typescript
// API Route: /api/admin/logistics/optimize-routes
async function optimizeRoute(orders: Order[]) {
  // Call ML service
  const optimized = await mlClient.post('/ml/route-optimize', {
    orders: orders.map(o => ({
      id: o.id,
      address: o.address,
      timeWindow: o.deliverySlot
    })),
    constraints: {
      maxStops: 50,
      maxDuration: 480 // 8 hours
    }
  })
  
  // Save optimization results
  await prisma.routeOptimization.create({
    data: {
      routeId: optimized.routeId,
      algorithm: 'genetic',
      originalDistance: optimized.originalDistance,
      optimizedDistance: optimized.optimizedDistance,
      savings: optimized.savings
    }
  })
  
  return optimized
}
```

**Optimization Goals:**
- Minimize total distance (primary)
- Minimize total time (secondary)
- Respect all constraints (hard)


## Error Handling

### Authentication Errors

**Scenarios:**
1. Invalid credentials
2. Expired session
3. Missing session
4. Invalid JWT

**Handling:**
```typescript
// Redirect to sign-in with callback URL
if (!session) {
  return {
    redirect: {
      destination: `/auth/signin?callbackUrl=${encodeURIComponent(req.url)}`,
      permanent: false
    }
  }
}
```

### Authorization Errors

**Scenarios:**
1. User accessing route not allowed for their role
2. User accessing API endpoint not allowed for their role
3. User accessing another user's resources

**Handling:**
```typescript
// Middleware: Redirect to role dashboard
if (!canAccessRoute(role, path)) {
  return NextResponse.redirect(getDashboardPath(role))
}

// API Route: Return 403 Forbidden
if (!canAccessApi(role, endpoint)) {
  return res.status(403).json({ 
    error: 'Forbidden',
    message: 'You do not have permission to access this resource'
  })
}
```

### Email Generation Errors

**Scenarios:**
1. Unsupported city
2. Database transaction failure
3. Duplicate email (race condition)

**Handling:**
```typescript
try {
  const email = await emailGenerator.generateEmail(name, city, role)
} catch (error) {
  if (error instanceof UnsupportedCityError) {
    return res.status(400).json({ 
      error: 'Invalid city',
      supportedCities: SUPPORTED_CITIES
    })
  }
  
  if (error instanceof DuplicateEmailError) {
    // Retry with incremented number
    return await emailGenerator.generateEmail(name, city, role)
  }
  
  // Generic error
  return res.status(500).json({ 
    error: 'Email generation failed',
    message: 'Please try again'
  })
}
```

### ML Service Errors

**Scenarios:**
1. ML service unavailable
2. Prediction timeout
3. Invalid input data
4. Model not trained

**Handling:**
```typescript
async function getMLPrediction(endpoint, data, fallback) {
  try {
    const response = await mlClient.post(endpoint, data, {
      timeout: 5000 // 5 second timeout
    })
    return response.data
  } catch (error) {
    // Log error for monitoring
    logger.error('ML service error', { endpoint, error })
    
    // Return fallback result
    return fallback()
  }
}

// Usage
const recommendations = await getMLPrediction(
  '/ml/recommendations',
  { userId },
  () => getTrendingProducts() // Fallback
)
```

### Farmer Approval Errors

**Scenarios:**
1. Farmer not found
2. Already approved/rejected
3. Missing required documents

**Handling:**
```typescript
async function approveFarmer(farmerId: string, adminId: string) {
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId }
  })
  
  if (!farmer) {
    throw new NotFoundError('Farmer not found')
  }
  
  if (farmer.isApproved) {
    throw new ValidationError('Farmer already approved')
  }
  
  // Update status
  await prisma.farmer.update({
    where: { id: farmerId },
    data: { isApproved: true }
  })
  
  // Send notification
  await sendApprovalEmail(farmer.userId)
}
```


## Testing Strategy

### Unit Testing

**Email Generator:**
- Test email format generation
- Test registration number increment
- Test name normalization
- Test city validation
- Test email parsing

**Role Access Control:**
- Test route access for each role
- Test API access for each role
- Test dashboard path resolution
- Test navigation item filtering

**ML Service Client:**
- Test API calls with mocked responses
- Test timeout handling
- Test fallback mechanisms
- Test cache integration

### Integration Testing

**Authentication Flow:**
- Test registration with email generation
- Test login with generated email
- Test session creation with role
- Test role-based redirects

**Authorization Flow:**
- Test middleware route protection
- Test API route protection
- Test component-level protection
- Test farmer approval workflow

**Dashboard Loading:**
- Test data fetching for each role
- Test widget rendering
- Test error states
- Test loading states

### End-to-End Testing

**User Journeys:**
1. Customer registration → login → browse products → add to cart → checkout
2. Farmer registration → pending approval → admin approval → access dashboard
3. Admin login → view pending farmers → approve farmer → view analytics
4. Driver login → view deliveries → update status → complete route

**Testing Tools:**
- Jest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests (optional, not required for MVP)

### Testing Priorities

**High Priority (Must Test):**
- Email generation uniqueness
- Role-based route access
- API authorization
- Authentication flow
- Farmer approval workflow

**Medium Priority (Should Test):**
- Dashboard data loading
- Component rendering
- Error handling
- Cache behavior

**Low Priority (Nice to Have):**
- ML service integration
- Performance metrics
- Edge cases

**Note:** Focus on core functionality tests. Avoid over-testing UI components or creating unnecessary test files.


## Performance Considerations

### Caching Strategy

**Session Caching:**
- JWT tokens cached in HTTP-only cookies
- No server-side session storage needed
- Reduces database queries

**ML Predictions Caching:**
```typescript
// Cache recommendations for 1 hour
redis.setex(`recommendations:${userId}`, 3600, data)

// Cache demand forecast until end of day
redis.setex(`forecast:${farmerId}:${date}`, 86400, data)

// Cache farmer score permanently (until retraining)
redis.set(`farmer-score:${farmerId}`, data)
```

**Database Query Optimization:**
- Use Prisma's `select` to fetch only needed fields
- Use `include` judiciously to avoid N+1 queries
- Index frequently queried fields (userId, role, email)
- Use database-level pagination for large lists

### API Response Times

**Target Latencies:**
- Authentication: < 200ms
- Dashboard data: < 500ms
- Product search: < 300ms
- ML predictions: < 500ms (with cache)
- Route optimization: < 2s

**Optimization Techniques:**
- Parallel data fetching with Promise.all()
- Lazy loading for non-critical widgets
- Pagination for large datasets
- CDN for static assets
- Image optimization (Next.js Image component)

### Database Indexing

**Required Indexes:**
```prisma
// Already indexed in schema
@@index([userId]) // For user lookups
@@index([farmerId]) // For farmer data
@@index([customerId]) // For customer data
@@unique([email]) // For authentication

// Additional indexes needed
@@index([role, city]) // For email generation
@@index([isApproved]) // For farmer approval queue
@@index([status]) // For order filtering
```

### Scalability Considerations

**Horizontal Scaling:**
- Stateless API routes (JWT-based auth)
- ML service can be scaled independently
- Redis for shared cache across instances

**Database Scaling:**
- Read replicas for analytics queries
- Connection pooling (Prisma default)
- Batch operations for bulk updates

**ML Service Scaling:**
- Separate prediction service from training
- Queue-based training jobs
- Model versioning for rollback


## Security Considerations

### Authentication Security

**Password Security:**
- Bcrypt hashing with salt rounds = 10
- Minimum password length: 8 characters
- No password complexity requirements (user choice)
- Secure password reset flow (future enhancement)

**Session Security:**
- HTTP-only cookies (prevent XSS)
- Secure flag in production (HTTPS only)
- SameSite=Lax (CSRF protection)
- JWT expiration: 7 days
- Refresh token rotation (future enhancement)

### Authorization Security

**Multi-Layer Protection:**
1. Middleware: Route-level authorization
2. API Routes: Endpoint-level authorization
3. Database Queries: Row-level security (check ownership)
4. Components: UI-level protection

**Resource Ownership:**
```typescript
// Always verify user owns the resource
async function getOrder(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId // Ownership check
    }
  })
  
  if (!order) {
    throw new ForbiddenError('Access denied')
  }
  
  return order
}
```

### Input Validation

**Zod Schemas:**
```typescript
// Registration schema
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.enum(SUPPORTED_CITIES),
  role: z.enum(['CUSTOMER', 'FARMER', 'ADMIN', 'OPERATIONS', 'DRIVER']),
  password: z.string().min(8),
  farmName: z.string().optional(),
  location: z.string().optional()
})

// Validate all API inputs
const validated = registerSchema.parse(req.body)
```

**SQL Injection Prevention:**
- Prisma ORM (parameterized queries)
- No raw SQL queries
- Input sanitization

**XSS Prevention:**
- React auto-escapes output
- No dangerouslySetInnerHTML
- Content Security Policy headers

### Rate Limiting

**Current Implementation:**
- 100 requests per 15 minutes per IP
- Applied to all API routes
- 429 status code when exceeded

**Future Enhancements:**
- Per-user rate limits
- Different limits for different endpoints
- Redis-based distributed rate limiting

### Data Privacy

**PII Protection:**
- Email addresses are system-generated (not personal)
- Phone numbers encrypted at rest (future)
- Address data access restricted by role
- Audit logs for sensitive operations (future)

**GDPR Compliance:**
- User data export (future)
- Right to deletion (future)
- Consent management (future)


## Deployment Architecture

### Environment Configuration

**Required Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_URL=https://agrotrack.com
NEXTAUTH_SECRET=<random-secret>

# Redis (for caching)
REDIS_URL=redis://...

# ML Service
ML_SERVICE_URL=http://ml-service:8000
ML_SERVICE_API_KEY=<secret-key>

# Email (for notifications)
SENDGRID_API_KEY=<key>
FROM_EMAIL=noreply@agrotrack.com

# Storage (for file uploads)
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_S3_BUCKET=agrotrack-files
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Next.js     │    │  Next.js     │    │  Next.js     │
│  Instance 1  │    │  Instance 2  │    │  Instance 3  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │  ML Service  │
│   Primary    │    │    Cache     │    │   (Python)   │
└──────────────┘    └──────────────┘    └──────────────┘
        │
        ▼
┌──────────────┐
│  PostgreSQL  │
│   Replica    │
└──────────────┘
```

### Deployment Steps

**1. Database Setup:**
```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (cities, roles)
npx prisma db seed
```

**2. Application Deployment:**
```bash
# Build Next.js application
npm run build

# Start production server
npm run start
```

**3. ML Service Deployment:**
```bash
# Build Docker image
docker build -t agrotrack-ml ./ml-service

# Deploy to container orchestration
kubectl apply -f ml-service-deployment.yaml
```

**4. Cache Setup:**
```bash
# Deploy Redis instance
# Configure connection string in environment
```

### Monitoring and Logging

**Application Monitoring:**
- Error tracking (Sentry or similar)
- Performance monitoring (New Relic or similar)
- Uptime monitoring (Pingdom or similar)

**Logging Strategy:**
```typescript
// Structured logging
logger.info('User registered', {
  userId,
  role,
  city,
  timestamp: new Date()
})

logger.error('ML service error', {
  endpoint,
  error: error.message,
  userId
})
```

**Metrics to Track:**
- API response times
- ML prediction latency
- Cache hit rates
- Authentication success/failure rates
- Role-based usage patterns


## Implementation Phases

### Phase 1: Core Role-Based System (Week 1-2)

**Priority: HIGH**

1. Email Generation System
   - Implement EmailGenerator service
   - Create email parsing utilities
   - Add city validation

2. Enhanced Authentication
   - Update registration API to use email generator
   - Add role to JWT token
   - Implement farmer approval status check

3. Access Control Infrastructure
   - Implement RoleAccessControl service
   - Update middleware with role-based authorization
   - Create API authorization utilities

4. Component-Level Protection
   - Create RoleBasedLayout component
   - Create RoleBasedHeader component
   - Update existing pages to use new components

5. Role-Specific Dashboards
   - Create dashboard layouts for each role
   - Implement basic widgets (no AI/ML yet)
   - Add navigation based on role

### Phase 2: AI/ML Integration (Week 3-4)

**Priority: MEDIUM**

1. ML Service Setup
   - Set up Python FastAPI service
   - Implement ML client in Next.js
   - Configure Redis caching

2. Product Recommendations
   - Train collaborative filtering model
   - Implement recommendation API
   - Add recommendations widget to customer dashboard

3. Demand Forecasting
   - Train time series model
   - Implement forecast API
   - Add forecast widget to farmer dashboard

4. Smart Search
   - Set up Elasticsearch (or use existing search)
   - Implement NLP preprocessing
   - Add auto-complete functionality

5. Farmer Approval Scoring
   - Train classification model
   - Implement scoring API
   - Add score display to admin farmer list

### Phase 3: Advanced Features (Week 5-6)

**Priority: LOW**

1. Route Optimization
   - Implement optimization algorithm
   - Create route visualization
   - Add to driver and admin portals

2. Enhanced Dashboards
   - Add more widgets with AI insights
   - Implement real-time updates
   - Add customization options

3. Notifications System
   - Email notifications for key events
   - In-app notification center
   - Push notifications (future)

4. Analytics and Reporting
   - Role-based analytics dashboards
   - Export functionality
   - Scheduled reports

### Out of Scope (Future Enhancements)

- Visual search
- Voice assistant
- Mobile app
- Advanced fraud detection
- Customer segmentation
- Dynamic pricing
- Certification OCR validation
- Quality control image recognition


## Design Decisions and Rationale

### 1. JWT-Based Sessions

**Decision:** Use JWT tokens stored in HTTP-only cookies for session management.

**Rationale:**
- Stateless authentication (no server-side session storage)
- Scales horizontally without session synchronization
- Role information embedded in token (no database lookup on each request)
- Existing NextAuth implementation supports this

**Trade-offs:**
- Cannot invalidate tokens before expiration (acceptable for 7-day expiry)
- Token size increases with more claims (minimal impact)

### 2. Email Generation Format

**Decision:** Use `{city}.{name}.{registrationNumber}@{role}.agrotrack.com` format.

**Rationale:**
- Professional appearance
- Easy to identify user role and location
- Unique per city/role combination
- No user input required (reduces friction)

**Trade-offs:**
- Users cannot choose their email (acceptable for B2B platform)
- Name changes require new email (rare occurrence)

### 3. Multi-Layer Authorization

**Decision:** Implement authorization at middleware, API route, and component levels.

**Rationale:**
- Defense in depth security
- Middleware catches unauthorized access early
- API routes protect data access
- Components provide UX feedback

**Trade-offs:**
- More code to maintain (acceptable for security)
- Slight performance overhead (negligible)

### 4. Separate ML Service

**Decision:** Deploy ML models in a separate Python service rather than in Next.js.

**Rationale:**
- Python ecosystem better for ML (scikit-learn, TensorFlow)
- Independent scaling of ML workloads
- Can use GPU instances for ML service only
- Easier to update models without redeploying main app

**Trade-offs:**
- Additional service to maintain
- Network latency between services (mitigated by caching)

### 5. Redis Caching for ML Predictions

**Decision:** Cache ML predictions in Redis with appropriate TTLs.

**Rationale:**
- Reduces ML service load
- Improves response times (< 200ms with cache)
- Predictions don't need to be real-time
- Cost-effective (fewer ML service calls)

**Trade-offs:**
- Stale predictions possible (acceptable with daily updates)
- Additional infrastructure (Redis)

### 6. Farmer Approval Workflow

**Decision:** Require admin approval for farmers before full access.

**Rationale:**
- Quality control for supply side
- Prevents fraudulent farmer accounts
- Allows verification of certifications
- Business requirement for platform trust

**Trade-offs:**
- Friction in farmer onboarding (necessary for quality)
- Admin workload (mitigated by AI scoring)

### 7. Minimal Testing Strategy

**Decision:** Focus tests on core business logic, avoid over-testing UI.

**Rationale:**
- Faster development iteration
- Tests provide value without slowing down
- UI tests are brittle and expensive to maintain
- Integration tests cover most scenarios

**Trade-offs:**
- Lower test coverage percentage (acceptable)
- May miss some edge cases (acceptable risk)

### 8. Fallback Strategies for ML

**Decision:** Always provide fallback results when ML service fails.

**Rationale:**
- System remains functional without ML
- Better user experience (no errors)
- ML is enhancement, not core functionality
- Gradual degradation of service

**Trade-offs:**
- Fallback results may be lower quality (acceptable)
- More code complexity (manageable)


## API Specifications

### Registration API

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```typescript
{
  name: string          // User's full name
  city: string          // From supported cities list
  role: UserRole        // CUSTOMER, FARMER, ADMIN, OPERATIONS, DRIVER
  password: string      // Min 8 characters
  farmName?: string     // Required if role=FARMER
  location?: string     // Required if role=FARMER
}
```

**Response:**
```typescript
{
  success: boolean
  user: {
    id: string
    email: string       // Generated email
    name: string
    role: UserRole
    city: string
    registrationNumber: string
  }
  message: string       // "Registration successful" or error message
}
```

**Status Codes:**
- 201: Created successfully
- 400: Validation error
- 409: Email already exists (rare race condition)
- 500: Server error

### Dashboard Data APIs

**Customer Dashboard:** `GET /api/customer/dashboard`

**Response:**
```typescript
{
  activeSubscriptions: number
  recentOrders: Order[]
  wishlistCount: number
  recommendedProducts: Product[]
  nextDelivery: {
    date: string
    itemCount: number
  } | null
  carbonFootprint: number
}
```

**Farmer Dashboard:** `GET /api/farmer/dashboard`

**Response:**
```typescript
{
  upcomingDeliveries: FarmerDelivery[]
  demandForecast: {
    productId: string
    productName: string
    quantity: number
    date: string
    confidence: number
  }[]
  qualityScore: {
    current: number
    trend: 'up' | 'down' | 'stable'
    history: { date: string; score: number }[]
  }
  revenue: {
    today: number
    week: number
    month: number
  }
  alerts: Alert[]
}
```

**Admin Dashboard:** `GET /api/admin/dashboard`

**Response:**
```typescript
{
  metrics: {
    totalOrders: number
    totalRevenue: number
    activeUsers: number
    activeFarmers: number
  }
  pendingFarmers: Farmer[]
  procurementList: ProcurementItem[]
  qualityAlerts: QCResult[]
  revenueForecast: {
    date: string
    forecast: number
    confidence: number
  }[]
}
```

### ML Service APIs

**Recommendations:** `POST /api/personalization/recommendations`

**Request:**
```typescript
{
  userId: string
  limit?: number        // Default: 10
  context?: string      // 'dashboard', 'product-page', 'cart'
}
```

**Response:**
```typescript
{
  products: Product[]
  confidence: number
  algorithm: string     // 'collaborative', 'content-based', 'trending'
}
```

**Demand Forecast:** `POST /api/farmer/demand-forecast`

**Request:**
```typescript
{
  farmerId: string
  days?: number         // Default: 7
}
```

**Response:**
```typescript
{
  forecasts: {
    productId: string
    productName: string
    predictions: {
      date: string
      quantity: number
      confidence: number
    }[]
  }[]
  accuracy: number      // Historical accuracy percentage
}
```

**Farmer Scoring:** `POST /api/admin/farmers/score`

**Request:**
```typescript
{
  farmerId: string
}
```

**Response:**
```typescript
{
  score: number         // 0-100
  factors: {
    name: string
    score: number
    weight: number
    details: string
  }[]
  recommendation: 'approve' | 'review' | 'reject'
}
```

### Farmer Approval APIs

**Approve Farmer:** `POST /api/admin/farmers/[id]/approve`

**Request:** No body required

**Response:**
```typescript
{
  success: boolean
  farmer: Farmer
  message: string
}
```

**Reject Farmer:** `POST /api/admin/farmers/[id]/reject`

**Request:**
```typescript
{
  reason: string        // Rejection reason
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
}
```


## Database Migrations

### Required Schema Changes

The existing Prisma schema already includes most required fields. No major migrations needed.

**Verification Checklist:**
- ✅ User.city field exists
- ✅ User.registrationNumber field exists
- ✅ User.role enum includes all 5 roles
- ✅ User.passwordHash field exists
- ✅ EmailRegistry model exists
- ✅ Farmer.isApproved field exists

**Optional Indexes to Add:**

```prisma
// Add to User model
@@index([role, city])

// Add to Farmer model
@@index([isApproved])

// Add to EmailRegistry model
// Already has @@unique([city, role])
```

### Seed Data

**Supported Cities:**
```typescript
const SUPPORTED_CITIES = [
  'bangalore',
  'mysore',
  'hubli',
  'mangalore',
  'belgaum',
  'gulbarga',
  'davangere',
  'bellary'
]
```

**Initial Admin User:**
```typescript
// Create initial admin for testing
await prisma.user.create({
  data: {
    email: 'bangalore.admin.001@admin.agrotrack.com',
    name: 'System Admin',
    role: 'ADMIN',
    city: 'bangalore',
    registrationNumber: '001',
    passwordHash: await hash('admin123', 10)
  }
})

// Initialize email registry
await prisma.emailRegistry.create({
  data: {
    city: 'bangalore',
    role: 'ADMIN',
    count: 1
  }
})
```

## Configuration Files

### Environment Variables Template

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agrotrack"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"

# ML Service (optional for development)
ML_SERVICE_URL="http://localhost:8000"
ML_SERVICE_API_KEY="dev-api-key"

# Email Service
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@agrotrack.com"

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="agrotrack-files"
AWS_REGION="us-east-1"
```

### Supported Cities Configuration

```typescript
// lib/config/cities.ts
export const SUPPORTED_CITIES = [
  'bangalore',
  'mysore',
  'hubli',
  'mangalore',
  'belgaum',
  'gulbarga',
  'davangere',
  'bellary'
] as const

export type SupportedCity = typeof SUPPORTED_CITIES[number]

export function isSupportedCity(city: string): city is SupportedCity {
  return SUPPORTED_CITIES.includes(city as SupportedCity)
}
```

### Role Configuration

```typescript
// lib/config/roles.ts
import { UserRole } from '@prisma/client'

export const ROLE_CONFIG: Record<UserRole, {
  displayName: string
  color: string
  dashboardPath: string
}> = {
  CUSTOMER: {
    displayName: 'Customer',
    color: 'blue',
    dashboardPath: '/dashboard'
  },
  FARMER: {
    displayName: 'Farmer',
    color: 'green',
    dashboardPath: '/farmer/dashboard'
  },
  ADMIN: {
    displayName: 'Admin',
    color: 'purple',
    dashboardPath: '/admin/dashboard'
  },
  OPERATIONS: {
    displayName: 'Operations',
    color: 'orange',
    dashboardPath: '/admin/dashboard'
  },
  DRIVER: {
    displayName: 'Driver',
    color: 'teal',
    dashboardPath: '/driver/dashboard'
  }
}
```

## Summary

This design document provides a comprehensive blueprint for implementing the role-based access control system with AI/ML features. The architecture is built on existing infrastructure (NextAuth, Prisma, PostgreSQL) with minimal new dependencies.

**Key Highlights:**
- Multi-layer security (middleware, API, component)
- Auto-generated professional email addresses
- Five distinct role-based portals
- Core AI/ML features with fallback strategies
- Scalable architecture for future enhancements
- Minimal testing approach focused on business logic
- Clear implementation phases

**Next Steps:**
- Review and approve this design
- Proceed to create implementation task list
- Begin Phase 1 development
