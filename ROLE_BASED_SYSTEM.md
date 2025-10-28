# 🎯 Role-Based Portal System - AgroTrack+

## Overview
Complete role-based access control system with auto-generated emails and role-specific functionality.

---

## 📧 Email Generation System

### Format
```
{city}.{name}.{registrationNumber}@{role}.agrotrack.com
```

### Examples
- **Customer**: `bangalore.john.001@customer.agrotrack.com`
- **Farmer**: `mysore.ramesh.042@farmer.agrotrack.com`
- **Admin**: `bangalore.priya.003@admin.agrotrack.com`
- **Operations**: `hubli.suresh.007@operations.agrotrack.com`
- **Driver**: `bangalore.kumar.015@driver.agrotrack.com`

### How It Works
1. User enters: Name, City, Role
2. System generates unique email automatically
3. Registration number auto-increments per city/role
4. Email sent with credentials
5. User logs in with generated email

---

## 👥 Role-Based Access Control

### 1. CUSTOMER Portal

#### **Accessible Pages**
```
✅ /                          - Home page
✅ /products                  - Browse products
✅ /products/[id]             - Product details
✅ /cart                      - Shopping cart
✅ /checkout                  - Checkout process
✅ /orders                    - Order history
✅ /orders/[id]               - Order details
✅ /subscriptions             - Manage subscriptions
✅ /subscriptions/create      - Create subscription
✅ /profile                   - User profile
✅ /wishlist                  - Saved items
✅ /dashboard                 - Customer dashboard
✅ /order-confirmation        - Order success page
✅ /about                     - About us
✅ /contact                   - Contact page
✅ /faq                       - FAQ page

❌ /farmer/*                  - Blocked
❌ /admin/*                   - Blocked
❌ /driver/*                  - Blocked
```

#### **Features**
- ✅ Browse products with AI recommendations
- ✅ Add to cart & wishlist
- ✅ Create & manage orders
- ✅ Manage subscriptions
- ✅ Track deliveries
- ✅ View profile & addresses
- ✅ Chat support
- ✅ Personalized recommendations
- ✅ Price drop alerts
- ✅ Carbon footprint tracking

#### **Dashboard Widgets**
- Active subscriptions count
- Recent orders timeline
- Wishlist items
- Recommended products (AI)
- Next delivery schedule
- Carbon footprint saved
- Spending analytics

#### **AI/ML Features**
1. **Smart Product Recommendations** - "You might also like..."
2. **Intelligent Search** - Natural language, voice search
3. **Subscription Optimizer** - AI suggests optimal box contents
4. **Delivery Time Prediction** - Real-time ETA
5. **Price Drop Alerts** - ML predicts price drops
6. **Freshness Predictor** - "Stays fresh for 5-7 days"
7. **Smart Chatbot** - Order tracking, recommendations
8. **Carbon Tracker** - Environmental impact calculation

---

### 2. FARMER Portal

#### **Accessible Pages**
```
✅ /                          - Home page
✅ /farmer/dashboard          - Farmer dashboard
✅ /farmer/products           - Product management
✅ /farmer/products/new       - Add new product
✅ /farmer/products/[id]      - Edit product
✅ /farmer/orders             - Incoming orders
✅ /farmer/deliveries         - Delivery schedule
✅ /farmer/insights           - Performance analytics
✅ /farmer/profile            - Farm profile
✅ /farmer/certifications     - Manage certifications
✅ /profile                   - User profile
✅ /about                     - About us
✅ /contact                   - Contact page

❌ /admin/*                   - Blocked
❌ /driver/*                  - Blocked
❌ /cart                      - Blocked
❌ /checkout                  - Blocked
```

#### **Features**
- ✅ Manage product catalog
- ✅ View delivery requirements (48hr notice)
- ✅ Track performance metrics
- ✅ Upload certifications (OCR validation)
- ✅ View QC results
- ✅ Manage inventory
- ✅ View analytics & insights
- ✅ Pricing recommendations

#### **Dashboard Widgets**
- Upcoming deliveries (next 7 days)
- Demand forecast (AI-powered)
- Quality score trend
- Revenue analytics
- Product performance
- Alerts & notifications
- Pricing suggestions (AI)
- Customer satisfaction score

#### **AI/ML Features**
1. **Demand Forecasting** - "Next week: 50kg tomatoes needed"
2. **Quality Score Predictor** - "Your tomatoes will score 4.2/5"
3. **Optimal Pricing** - "Increase price by ₹5 - high demand"
4. **Harvest Planning** - When to plant based on forecasts
5. **Performance Analytics** - Trend analysis, benchmarking
6. **Smart Alerts** - Quality drops, high demand, pricing
7. **Image QC** - Upload photo, get instant quality feedback
8. **Revenue Optimization** - Which products to focus on

---

### 3. ADMIN Portal

#### **Accessible Pages**
```
✅ /                          - Home page
✅ /admin/dashboard           - Admin dashboard
✅ /admin/farmers             - Farmer management
✅ /admin/farmers/[id]        - Farmer details
✅ /admin/users               - User management
✅ /admin/procurement         - Procurement lists
✅ /admin/delivery-zones      - Zone configuration
✅ /admin/qc                  - Quality control
✅ /admin/analytics           - Business intelligence
✅ /admin/settings            - System settings
✅ /admin/files               - File management
✅ /admin/logistics           - Route planning
✅ /profile                   - User profile

❌ /farmer/*                  - Blocked (unless viewing)
❌ /driver/*                  - Blocked
❌ /cart                      - Blocked
```

#### **Features**
- ✅ Approve/reject farmers
- ✅ Manage all users
- ✅ View all orders
- ✅ Generate procurement lists
- ✅ Configure delivery zones
- ✅ Quality control management
- ✅ View platform analytics
- ✅ System configuration
- ✅ File management
- ✅ Fraud detection
- ✅ Dynamic pricing control

#### **Dashboard Widgets**
- Platform metrics (GMV, orders, users)
- Pending farmer approvals
- Daily procurement list
- Quality alerts
- Revenue forecast (AI)
- Customer churn prediction (AI)
- Inventory status
- Fraud alerts (AI)
- System health monitoring

#### **AI/ML Features**
1. **Farmer Approval Scoring** - Auto-score applications
2. **Procurement Intelligence** - AI-generated lists
3. **QC Automation** - Image recognition for quality
4. **Inventory Management** - Stock-out predictions
5. **Farmer Performance** - ML-powered rankings
6. **Route Optimization** - AI-optimized delivery routes
7. **Fraud Detection** - Unusual pattern detection
8. **Business Intelligence** - Revenue forecasting, CLV
9. **Dynamic Pricing** - Real-time price optimization
10. **Certification AI** - OCR + verification
11. **Customer Segmentation** - ML-based clustering
12. **Anomaly Detection** - System behavior monitoring

---

### 4. OPERATIONS Portal

#### **Accessible Pages**
```
✅ /                          - Home page
✅ /admin/dashboard           - Operations dashboard
✅ /admin/procurement         - Procurement management
✅ /admin/delivery-zones      - Delivery zones
✅ /admin/qc                  - Quality control
✅ /admin/logistics           - Logistics & routes
✅ /admin/analytics           - Operational analytics
✅ /profile                   - User profile

❌ /admin/farmers             - Blocked (view only)
❌ /admin/users               - Blocked
❌ /admin/settings            - Blocked
❌ /farmer/*                  - Blocked
❌ /driver/*                  - Blocked
```

#### **Features**
- ✅ Manage procurement
- ✅ Quality control operations
- ✅ Route optimization
- ✅ Inventory management
- ✅ View operational analytics
- ✅ Manage deliveries

#### **Dashboard Widgets**
- Daily procurement list
- Quality alerts
- Active delivery routes
- Inventory status
- Operational metrics
- QC results summary

#### **AI/ML Features**
1. **Procurement Intelligence** - Optimal quantities
2. **QC Automation** - Image-based quality checks
3. **Route Optimization** - AI-optimized routes
4. **Inventory Predictions** - Stock management
5. **Quality Predictions** - Early warning system
6. **Operational Analytics** - Efficiency metrics

---

### 5. DRIVER Portal

#### **Accessible Pages**
```
✅ /                          - Home page
✅ /driver/dashboard          - Driver dashboard
✅ /driver/deliveries         - My deliveries
✅ /driver/deliveries/[id]    - Delivery details
✅ /driver/route              - Navigation & route
✅ /driver/earnings           - Earnings tracker
✅ /profile                   - User profile

❌ /admin/*                   - Blocked
❌ /farmer/*                  - Blocked
❌ /products                  - Blocked
❌ /cart                      - Blocked
```

#### **Features**
- ✅ View assigned deliveries
- ✅ Update delivery status
- ✅ Navigate optimized route
- ✅ Mark orders as delivered
- ✅ View earnings
- ✅ Contact customers

#### **Dashboard Widgets**
- Today's deliveries
- Active route map
- Delivery performance
- Today's earnings
- Navigation assistance
- Customer notes & preferences

#### **AI/ML Features**
1. **Smart Route Navigation** - AI-optimized sequence
2. **Delivery Time Predictions** - Accurate ETAs
3. **Load Optimization** - How to pack vehicle
4. **Customer Availability** - "Usually home after 6 PM"
5. **Performance Analytics** - Success rate, timing
6. **Smart Alerts** - Traffic, weather, special instructions
7. **Voice Assistant** - Hands-free operation
8. **Earnings Predictor** - "3 more for bonus"

---

## 🔐 Security & Access Control

### Middleware Protection
```typescript
// middleware.ts
- Rate limiting per IP
- Role-based route protection
- CSRF token validation
- Security headers
- Session validation
```

### API Route Protection
```typescript
// All API routes check:
1. Authentication (valid session)
2. Role authorization (hasApiAccess)
3. Resource ownership (user can only access their data)
4. Input validation (Zod schemas)
```

### Component-Level Protection
```typescript
// Use RoleBasedLayout wrapper
<RoleBasedLayout allowedRoles={['ADMIN', 'OPERATIONS']}>
  <AdminContent />
</RoleBasedLayout>
```

---

## 🚀 Implementation Guide

### 1. User Registration Flow
```
1. User visits /auth/register
2. Fills: Name, City, Role, Password
3. (If Farmer: Farm Name, Location)
4. System generates email: city.name.XXX@role.agrotrack.com
5. Creates user + role-specific profile
6. Sends welcome email with credentials
7. (If Farmer: Pending admin approval)
8. Redirects to /auth/signin
```

### 2. Login Flow
```
1. User enters generated email + password
2. NextAuth validates credentials
3. Session created with role
4. Redirects to role-specific dashboard:
   - CUSTOMER → /dashboard
   - FARMER → /farmer/dashboard
   - ADMIN/OPERATIONS → /admin/dashboard
   - DRIVER → /driver/dashboard
```

### 3. Navigation Flow
```
1. User clicks navigation link
2. Middleware checks route access
3. If allowed: Page loads
4. If blocked: Redirect to role dashboard
5. Header shows only allowed navigation items
```

### 4. API Request Flow
```
1. Frontend makes API request
2. Middleware validates session
3. API route checks role permission
4. If allowed: Process request
5. If blocked: Return 403 Forbidden
```

---

## 📊 Database Schema Updates

### Add to User Model
```prisma
model User {
  // ... existing fields
  city          String?   // For email generation
  registrationNumber String? // Auto-generated
}
```

### Track Email Generation
```prisma
model EmailRegistry {
  id        String   @id @default(cuid())
  city      String
  role      UserRole
  count     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([city, role])
}
```

---

## 🎨 UI Components

### Role-Specific Layouts
- `<RoleBasedHeader />` - Shows only allowed navigation
- `<RoleBasedLayout />` - Protects pages
- `<RoleDashboard />` - Role-specific dashboard widgets

### Email Display
- Shows parsed email components
- City, Name, Registration Number
- Role badge with color coding

---

## 🧪 Testing

### Test Each Role
```bash
# Create test users
POST /api/auth/register
{
  "name": "Test Customer",
  "city": "bangalore",
  "role": "CUSTOMER",
  "password": "test1234"
}

# Login and verify access
POST /api/auth/signin
{
  "email": "bangalore.testcustomer.001@customer.agrotrack.com",
  "password": "test1234"
}

# Try accessing blocked routes (should redirect)
GET /farmer/dashboard (as CUSTOMER) → Redirect to /dashboard
GET /admin/dashboard (as CUSTOMER) → Redirect to /dashboard
```

---

## 📈 Monitoring & Analytics

### Track by Role
- Active users per role
- Feature usage per role
- API calls per role
- Performance metrics per role
- Error rates per role

### Email Analytics
- Registration numbers per city
- Role distribution
- Email validation success rate

---

## 🔄 Migration Plan

### Phase 1: Setup (Week 1)
- ✅ Create email generator
- ✅ Create role access control
- ✅ Update registration API
- ✅ Create role-based layouts

### Phase 2: Pages (Week 2)
- ✅ Update all page components
- ✅ Add role-based navigation
- ✅ Create role-specific dashboards
- ✅ Add middleware protection

### Phase 3: Testing (Week 3)
- Test each role thoroughly
- Verify access control
- Test email generation
- Load testing

### Phase 4: Deployment (Week 4)
- Deploy to staging
- User acceptance testing
- Deploy to production
- Monitor and iterate

---

## 📝 Usage Examples

### Register as Customer
```typescript
// User fills form
name: "John Doe"
city: "bangalore"
role: "CUSTOMER"
password: "secure123"

// System generates
email: "bangalore.johndoe.001@customer.agrotrack.com"

// User receives email with credentials
```

### Register as Farmer
```typescript
// User fills form
name: "Ramesh Kumar"
city: "mysore"
role: "FARMER"
farmName: "Green Valley Farms"
location: "Mysore District"
password: "secure123"

// System generates
email: "mysore.rameshkumar.042@farmer.agrotrack.com"

// Status: Pending admin approval
```

### Admin Approves Farmer
```typescript
// Admin dashboard shows pending farmers
// Admin clicks "Approve"
// Farmer receives approval email
// Farmer can now access full portal
```

---

## 🎯 Benefits

### For Users
- ✅ No need to choose email
- ✅ Unique, professional email
- ✅ Easy to remember format
- ✅ Role immediately identifiable
- ✅ City-based organization

### For System
- ✅ Automatic email generation
- ✅ No duplicate emails
- ✅ Easy user identification
- ✅ Role-based routing
- ✅ Scalable architecture

### For Business
- ✅ Professional branding
- ✅ Easy user management
- ✅ Clear role separation
- ✅ Audit trail
- ✅ Analytics by role/city

---

## 🚨 Important Notes

1. **Email Format**: Cannot be changed after registration
2. **Role Changes**: Require admin approval
3. **City**: Must be from supported list
4. **Registration Number**: Auto-increments, cannot skip
5. **Farmer Approval**: Required before full access
6. **Password**: Min 8 characters, stored hashed
7. **Session**: JWT-based, role included in token

---

## 📞 Support

For issues or questions:
- Email: support@agrotrack.com
- Documentation: /docs
- Admin Portal: /admin/support

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
