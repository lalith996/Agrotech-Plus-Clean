# AgroTrack+ Navigation Guide

## Quick Access URLs

### Public Pages (No Login Required)
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Main landing page |
| Products | `/products` | Browse all products |
| Vegetables | `/products?category=vegetables` | Vegetable products |
| Fruits | `/products?category=fruits` | Fruit products |
| Dairy | `/products?category=dairy` | Dairy products |
| Organic | `/products?organic=true` | Organic products |
| Farmers | `/farmers` | Browse local farmers |
| About | `/about` | About us page |
| Contact | `/contact` | Contact form |
| FAQ | `/faq` | Frequently asked questions |
| Sign In | `/auth/signin` | Login page |
| Sign Up | `/auth/signup` | Registration page |
| Demo Login | `/demo-login` | Quick demo access |

### Protected Pages (Login Required)
| Page | URL | Role | Description |
|------|-----|------|-------------|
| Customer Dashboard | `/dashboard` | CUSTOMER | Customer overview |
| Farmer Dashboard | `/farmer/dashboard` | FARMER | Farmer management |
| Admin Dashboard | `/admin/dashboard` | ADMIN/OPERATIONS | Admin panel |
| Profile | `/profile` | All | User profile settings |
| Orders | `/orders` | CUSTOMER | Order history |
| Cart | `/cart` | CUSTOMER | Shopping cart |
| Wishlist | `/wishlist` | CUSTOMER | Saved items |
| Subscriptions | `/subscriptions` | CUSTOMER | Manage subscriptions |

## API Endpoints

### Public APIs (GET without auth)
```bash
GET /api/health              # System health check
GET /api/auth/session        # Check session status
GET /api/products            # List products
GET /api/farmers             # List farmers
```

### Protected APIs (Auth required)
```bash
GET  /api/customer/dashboard  # Customer dashboard data
GET  /api/farmer/dashboard    # Farmer dashboard data
GET  /api/admin/dashboard     # Admin dashboard data
GET  /api/orders              # List orders
POST /api/orders              # Create order
GET  /api/subscriptions       # List subscriptions
POST /api/subscriptions       # Create subscription
```

## User Roles and Access

### CUSTOMER
- Can browse and purchase products
- Access to: Dashboard, Orders, Cart, Wishlist, Profile
- Cannot access: Farmer or Admin pages

### FARMER
- Can manage products and view orders
- Access to: Farmer Dashboard, Products Management, Profile
- Cannot access: Customer or Admin pages

### ADMIN / OPERATIONS
- Full system access
- Access to: Admin Dashboard, User Management, Analytics
- Can view all data and manage system

## Navigation Flow

### For New Users
1. Visit home page (`/`)
2. Browse products (`/products`)
3. Sign up (`/auth/signup`)
4. Complete profile
5. Start shopping

### For Returning Users
1. Sign in (`/auth/signin`)
2. Redirected to role-specific dashboard
3. Access all features based on role

### For Demo Users
1. Visit demo login (`/demo-login`)
2. Select role to test
3. Instant access to demo account

## Mobile Navigation

All pages are fully responsive and accessible on mobile devices:
- Hamburger menu for main navigation
- Touch-friendly buttons and links
- Optimized layouts for small screens
- Swipe gestures for cart and menus

## Search Functionality

Search bar available in header:
- Search products by name
- Filter by category
- Sort by price, rating, newest
- Real-time results

## Quick Actions

### From Header
- Click logo → Home
- Click cart icon → Open cart drawer
- Click wishlist icon → View wishlist
- Click user avatar → User menu

### From Dashboard
- Quick links to frequently used pages
- Recent orders overview
- Recommended products
- Active subscriptions

## Troubleshooting

### Page Not Loading?
1. Check if you're logged in (for protected pages)
2. Clear browser cache
3. Check internet connection
4. Try refreshing the page

### Can't Access a Page?
1. Verify you have the correct role
2. Check if you're logged in
3. Contact support if issue persists

### Navigation Not Working?
1. Ensure JavaScript is enabled
2. Try a different browser
3. Clear cookies and cache
4. Check for browser extensions blocking scripts

## Support

For navigation issues or questions:
- Email: support@agrotrack.com
- Phone: +91 80 1234 5678
- FAQ: `/faq`
- Contact Form: `/contact`
