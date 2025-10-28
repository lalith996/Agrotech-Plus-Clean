# 🧪 MANUAL TESTING GUIDE - Complete System Verification

## Prerequisites
✅ **Server must be running**: `npm run dev` in a terminal
✅ **Browser**: Chrome, Firefox, Safari, or Edge
✅ **Demo accounts**: Already seeded in database

---

## 🚀 START THE SERVER

```bash
cd /Users/lalithmachavarapu/Downloads/Agrotech-Plus-main-2
npm run dev
```

Wait for: `✓ Ready in XXXms` 
Server URL: `http://localhost:3000`

---

## ✅ TEST 1: PUBLIC PAGES (No Authentication Required)

### Home Page
1. Open: `http://localhost:3000/`
2. **Expected**: Home page loads with header, hero section, products
3. **Verify**: Navigation menu works, images load

### Demo Login Page  
1. Open: `http://localhost:3000/demo-login`
2. **Expected**: Page shows 5 demo account cards (Customer, Farmer, Admin, Driver, Operations)
3. **Verify**: Each card displays role, email, and "Login as X" button

### Enhanced Landing Page
1. Open: `http://localhost:3000/landing-enhanced`
2. **Expected**: Animated landing page with parallax effects
3. **Verify**: GSAP animations working, scroll effects smooth

### Animation Showcase
1. Open: `http://localhost:3000/showcase`
2. **Expected**: Page demonstrating all animation types
3. **Verify**: Buttons animate on hover, counters increment

### Other Public Pages
- ✅ `/about` - About page loads
- ✅ `/contact` - Contact form displays
- ✅ `/faq` - FAQ accordion works
- ✅ `/products` - Products listing loads
- ✅ `/farmers` - Farmers page displays
- ✅ `/auth/signin` - Login form shows
- ✅ `/auth/signup` - Registration form shows

---

## 🔒 TEST 2: AUTHENTICATION FLOW

### A. Login with Demo Account

1. **Go to Demo Login**
   ```
   http://localhost:3000/demo-login
   ```

2. **Click "Login as Customer"** 
   - Email: `customer@demo.com`
   - Password: `demo123`

3. **Expected Results:**
   - ✅ Redirects to `/dashboard`
   - ✅ Shows "Welcome back, Demo!" message
   - ✅ Browser console shows: `[Dashboard] Fetching dashboard data...`
   - ✅ Dashboard loads with metrics (subscriptions, orders, wishlist)

4. **Check Browser Console:**
   ```
   [Dashboard] Fetching dashboard data for user: customer@demo.com
   [Dashboard] API response status: 200
   [Dashboard] Data loaded successfully: [...keys]
   ```

### B. Navigation While Logged In

1. **Header Navigation**
   - Click user avatar (top right) → Dropdown menu appears
   - Click "Dashboard" → Returns to dashboard
   - Click "Profile" → Goes to profile page
   - Click "My Orders" → Shows orders page

2. **Mobile Menu**
   - Resize browser to mobile width (<768px)
   - Click hamburger menu (☰) → Sidebar opens
   - Navigation links work correctly
   - Close button (✕) closes sidebar

### C. Logout

1. **Click User Avatar** → "Sign out"
2. **Expected**: Redirects to home page, session cleared
3. **Verify**: Clicking "Dashboard" now redirects to login

---

## 🔌 TEST 3: API ENDPOINTS

### Health Check
```bash
curl http://localhost:3000/api/health
```
**Expected**: `{"status":"ok"}` or similar

### Products API
```bash
curl http://localhost:3000/api/products
```
**Expected**: JSON array of products

### Session API (requires login)
**Open browser console while logged in:**
```javascript
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```
**Expected**: Session object with user info

### Customer Dashboard API
**While logged in as customer, open console:**
```javascript
fetch('/api/customer/dashboard')
  .then(r => r.json())
  .then(d => console.log('Dashboard data:', d))
```
**Expected**: 
```json
{
  "activeSubscriptions": 0,
  "recentOrders": [],
  "nextDelivery": null,
  "recommendedProducts": [...]
}
```

---

## 🎯 TEST 4: ROLE-BASED ACCESS

### Test Each Role

#### 1. Customer (Already Tested Above)
- ✅ Dashboard: `/dashboard`
- ✅ Orders: `/orders`
- ✅ Profile: `/profile`
- ✅ Cart: `/cart`

#### 2. Farmer
1. **Logout** if logged in
2. **Go to** `/demo-login`
3. **Login as Farmer** (`farmer@demo.com` / `demo123`)
4. **Expected**: Redirects to `/farmer/dashboard`
5. **Test Navigation:**
   - Products: `/farmer/products`
   - Orders: `/farmer/orders`
   - Deliveries: `/farmer/deliveries`
   - Profile: `/farmer/profile`

#### 3. Admin
1. **Login as Admin** (`admin@demo.com` / `demo123`)
2. **Expected**: Redirects to `/admin/dashboard`
3. **Verify**: Admin-specific features accessible

#### 4. Driver
1. **Login as Driver** (`driver@demo.com` / `demo123`)
2. **Expected**: Redirects to `/driver/dashboard`

#### 5. Operations
1. **Login as Operations** (`operations@demo.com` / `demo123`)
2. **Expected**: Redirects to operations dashboard

---

## 🛡️ TEST 5: SECURITY & ACCESS CONTROL

### Verify Protected Routes

1. **Logout** (or use incognito/private window)

2. **Try to access protected pages directly:**
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/farmer/dashboard`
   - `http://localhost:3000/admin/dashboard`

3. **Expected**: All redirect to `/auth/signin` with callback URL

### Verify Public Assets

1. **Check images load** (should NOT require auth):
   - Product images: `/images/products/*.jpg`
   - Icons: `/icons/*.png`
   - Patterns: `/pattern.svg`

2. **Check PWA manifest** (should be public):
   - `/manifest.json` - Returns JSON
   - `/sw.js` - Service worker file

---

## 📊 TEST 6: DASHBOARD DATA LOADING

### Customer Dashboard

1. **Login as Customer**
2. **Open Dashboard**: `/dashboard`
3. **Open Browser DevTools** (F12)
4. **Go to Network Tab**
5. **Refresh Page** (Ctrl/Cmd + R)

**Verify Network Requests:**
- ✅ `GET /api/auth/session` → Status: 200
- ✅ `GET /api/customer/dashboard` → Status: 200
- ✅ Response contains: `activeSubscriptions`, `recentOrders`, `recommendedProducts`

**Verify UI Elements:**
- ✅ Metrics cards show numbers
- ✅ "Active Subscriptions" displays count
- ✅ "Recent Orders" displays count
- ✅ "Wishlist Items" displays count
- ✅ Recommended products section shows products

---

## 🎨 TEST 7: ANIMATIONS & UI

### Button Animations
1. **Go to**: `/showcase`
2. **Hover over buttons** → Magnetic effect works
3. **Click buttons** → Ripple effect appears
4. **Verify**: Smooth animations, no lag

### Parallax Effects
1. **Go to**: `/landing-enhanced`
2. **Scroll down page** → Background moves slower than foreground
3. **Verify**: Smooth parallax scrolling

### Glass Effects (Safari Compatibility)
1. **Open in Safari browser**
2. **Check glass cards** have blur effect
3. **Verify**: Backdrop filter working with webkit prefix

---

## 🐛 TEST 8: ERROR HANDLING

### API Error
1. **Login as Customer**
2. **Open Browser Console**
3. **Run**: 
   ```javascript
   fetch('/api/nonexistent').then(r => console.log(r.status))
   ```
4. **Expected**: 404 error handled gracefully

### Protected Route Error
1. **Logout**
2. **Try**: `http://localhost:3000/dashboard`
3. **Expected**: Redirect to login, no error shown

---

## ✅ EXPECTED RESULTS SUMMARY

### All Tests Should Show:

#### ✅ Public Pages
- All public pages load without authentication
- Images and assets load correctly
- Navigation menus work properly

#### ✅ Authentication
- Login works for all 5 demo roles
- Session persists across page reloads
- Logout clears session correctly

#### ✅ Protected Routes
- Dashboard accessible after login
- Correct dashboard for each role
- Unauthenticated users redirected to login

#### ✅ API Endpoints
- Health check returns OK
- Products API returns data
- Session API returns user info when logged in
- Dashboard API returns customer data

#### ✅ Navigation
- Header navigation works
- Mobile menu functions correctly
- Role-based sidebar shows correct links

#### ✅ Data Loading
- Dashboard fetches data on mount
- Browser console shows successful API calls
- UI updates with fetched data

#### ✅ Animations
- GSAP animations smooth and functional
- Button hover/click effects work
- Parallax scrolling operates correctly

---

## 🚨 KNOWN NON-ISSUES

### Expected Warnings (Can be Ignored)

1. **Middleware Deprecation Warning**
   ```
   ⚠ The "middleware" file convention is deprecated
   ```
   **Status**: Non-blocking, Next.js framework-level warning

2. **Cold Start 404s**
   ```
   GET /api/auth/session 404
   ```
   **Status**: Normal on first load, compiles on first access

3. **CSS Linter Warnings**
   ```
   Unknown at rule @tailwind
   ```
   **Status**: False positive, Tailwind processes correctly

---

## 📝 TROUBLESHOOTING

### Server Won't Start
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

### Database Connection Error
```bash
# Check .env.local has DATABASE_URL
cat .env.local | grep DATABASE_URL

# Restart PostgreSQL if needed
brew services restart postgresql
```

### Dashboard Not Loading Data
1. **Check browser console** for errors
2. **Verify** you're logged in: Check user avatar in header
3. **Network tab** should show `/api/customer/dashboard` call
4. **If 404**: Customer profile missing, run seed script again

### Session Not Persisting
1. **Check** NEXTAUTH_SECRET in `.env.local`
2. **Clear browser cookies** and login again
3. **Try incognito** window to rule out cache issues

---

## 🎉 SUCCESS CRITERIA

### ✅ All Tests Passed If:

- Public pages load without errors
- Demo login works for all 5 roles
- Dashboard shows data after login
- Navigation works in desktop and mobile
- API endpoints return expected responses
- Role-based access control working
- Animations render smoothly
- No console errors (warnings OK)

---

## 📞 NEED HELP?

### Check These Files:
- **Bug Fixes**: `BUG_FIX_SUMMARY.md`
- **Animation Docs**: `ANIMATION_COMPLETE_SUMMARY.md`
- **Demo Accounts**: All use password `demo123`

### Demo Account Emails:
- Customer: `customer@demo.com`
- Farmer: `farmer@demo.com`
- Admin: `admin@demo.com`
- Driver: `driver@demo.com`
- Operations: `operations@demo.com`

---

*Last Updated: October 28, 2025*  
*Testing completed successfully with all critical functionality verified* ✅
