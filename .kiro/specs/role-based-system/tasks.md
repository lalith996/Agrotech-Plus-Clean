# Implementation Plan

This implementation plan breaks down the role-based system with AI/ML features into discrete, actionable coding tasks. Each task builds incrementally on previous work, with all code integrated and functional at each step.

## Task List

- [x] 1. Set up core infrastructure and configuration
  - Create configuration files for supported cities and role settings
  - Set up environment variables template
  - Add database indexes for performance optimization
  - _Requirements: 1.4, 2.4_

- [x] 1.1 Create cities configuration module
  - Create `lib/config/cities.ts` with supported cities list and validation function
  - Export type-safe city constants
  - _Requirements: 1.4_

- [x] 1.2 Create roles configuration module
  - Create `lib/config/roles.ts` with role display names, colors, and dashboard paths
  - Export role configuration object
  - _Requirements: 2.1, 2.2, 2.3, 4.4, 5.4, 6.4, 7.4, 8.4_

- [x] 1.3 Update Prisma schema with indexes
  - Add index on User model for [role, city]
  - Add index on Farmer model for [isApproved]
  - Run migration to apply indexes
  - _Requirements: 9.2_

- [x] 2. Implement email generation system
  - Create email generator service with registration number management
  - Implement email parsing utilities
  - Add atomic increment for registration numbers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.1 Create EmailGenerator service class
  - Create `lib/email-generator.ts` with EmailGenerator class
  - Implement generateEmail method with name normalization and city validation
  - Implement getNextRegistrationNumber with atomic database operations
  - Implement parseEmail method to extract email components
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.2 Add email generation utilities
  - Create helper functions for name normalization (remove spaces, lowercase)
  - Create email format validation function
  - Export email generator instance for use across the app
  - _Requirements: 1.1, 1.3_

- [x] 3. Implement role-based access control system
  - Create access control service with route and API permission checking
  - Define access matrices for all roles
  - Implement navigation item filtering
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 9.2, 16.1, 16.2, 16.4, 16.5_

- [x] 3.1 Create RoleAccessControl service class
  - Create `lib/role-access-control.ts` with RoleAccessControl class
  - Implement canAccessRoute method with route access matrix for all 5 roles
  - Implement canAccessApi method with API access patterns
  - Implement getDashboardPath method
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 16.4, 16.5_

- [x] 3.2 Define navigation configuration
  - Create navigation items array with role-based visibility
  - Implement getNavigationItems method to filter by role
  - Export navigation configuration
  - _Requirements: 4.3, 5.4, 6.4, 7.4, 8.4, 16.2_

- [x] 3.3 Export access control instance
  - Create singleton instance of RoleAccessControl
  - Export for use in middleware, API routes, and components
  - _Requirements: 9.2, 16.4, 16.5_

- [x] 4. Update authentication system
  - Enhance registration API to use email generator
  - Update NextAuth callbacks to include role in session
  - Implement farmer approval status checking
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 17.3_

- [x] 4.1 Update registration API endpoint
  - Modify `pages/api/auth/register.ts` to use EmailGenerator
  - Add validation for city and role using Zod schema
  - Create User record with generated email
  - Create role-specific profile (Customer or Farmer)
  - Handle farmer approval workflow (set isApproved=false)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 17.3_

- [x] 4.2 Update registration form component
  - Modify `pages/auth/register.tsx` to include city and role selection
  - Add conditional fields for farmer registration (farmName, location)
  - Display generated email format preview
  - Show success message with generated email
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 4.3 Enhance NextAuth configuration
  - Update `lib/auth.ts` JWT callback to include role
  - Update session callback to include role in session.user
  - Ensure role is available in all authenticated requests
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Implement middleware protection
  - Enhance middleware with role-based route authorization
  - Add redirect logic for unauthorized access
  - Integrate with RoleAccessControl service
  - _Requirements: 4.2, 5.2, 6.2, 7.2, 8.2, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 5.1 Update middleware with role authorization
  - Modify `middleware.ts` to check role-based route access
  - Implement redirect to role dashboard for unauthorized routes
  - Keep existing security headers and rate limiting
  - Add role-based access logging
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6. Create reusable access control components
  - Implement RoleBasedLayout wrapper component
  - Implement RoleBasedHeader with role-filtered navigation
  - Add role badge display
  - _Requirements: 4.3, 5.4, 6.4, 7.4, 8.4, 16.1, 16.2, 16.3_

- [x] 6.1 Create RoleBasedLayout component
  - Create `components/auth/role-based-layout.tsx`
  - Accept allowedRoles prop and check against session role
  - Redirect to role dashboard if unauthorized
  - Show loading state during session check
  - _Requirements: 16.1, 16.3_

- [x] 6.2 Create RoleBasedHeader component
  - Create `components/layout/role-based-header.tsx`
  - Filter navigation items based on user role
  - Display user email with parsed components (city, name, number)
  - Add role badge with color coding from role config
  - Highlight active route
  - _Requirements: 4.3, 5.4, 6.4, 7.4, 8.4, 16.2_

- [x] 6.3 Update main layout to use RoleBasedHeader
  - Replace existing header with RoleBasedHeader in main layout
  - Ensure header displays correctly for all roles
  - _Requirements: 16.2_

- [x] 7. Implement API route protection utilities
  - Create API authorization helper functions
  - Add resource ownership verification
  - Implement consistent error responses
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7.1 Create API authorization utilities
  - Create `lib/api-auth.ts` with authorization helper functions
  - Implement requireAuth function to validate session
  - Implement requireRole function to check role permissions
  - Implement verifyOwnership function for resource access
  - Create standard error response functions (401, 403)
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7.2 Add input validation schemas
  - Create Zod schemas for registration, login, and common API inputs
  - Export validation functions for reuse
  - _Requirements: 9.5_

- [x] 8. Create customer dashboard
  - Implement customer dashboard page with role protection
  - Create dashboard data API endpoint
  - Build dashboard widgets for customer metrics
  - _Requirements: 4.1, 4.4, 4.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 8.1 Create customer dashboard API endpoint
  - Create `pages/api/customer/dashboard.ts`
  - Fetch active subscriptions count
  - Fetch recent orders (last 5)
  - Fetch wishlist count
  - Calculate next delivery date
  - Return structured dashboard data
  - _Requirements: 4.5, 18.5_

- [x] 8.2 Create customer dashboard page
  - Create or update `pages/dashboard.tsx` for customer role
  - Use RoleBasedLayout with allowedRoles=['CUSTOMER']
  - Fetch dashboard data from API
  - Display widgets: subscriptions, recent orders, wishlist, next delivery
  - Add quick action buttons (browse products, view orders)
  - _Requirements: 4.1, 4.4, 18.1, 18.2, 18.3, 18.4_

- [x] 9. Create farmer dashboard
  - Implement farmer dashboard page with role protection
  - Create farmer dashboard data API endpoint
  - Build dashboard widgets for farmer metrics
  - Handle pending approval state
  - _Requirements: 5.1, 5.3, 5.4, 5.5, 17.4, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 9.1 Create farmer dashboard API endpoint
  - Create `pages/api/farmer/dashboard.ts`
  - Check farmer approval status
  - Fetch upcoming deliveries (next 7 days)
  - Fetch quality score trend
  - Fetch revenue analytics
  - Return structured dashboard data with approval status
  - _Requirements: 5.3, 5.5, 18.5_

- [x] 9.2 Create farmer dashboard page
  - Create or update `pages/farmer/dashboard.tsx`
  - Use RoleBasedLayout with allowedRoles=['FARMER']
  - Fetch dashboard data from API
  - Show pending approval message if not approved
  - Display widgets: deliveries, quality score, revenue
  - Add quick action buttons (manage products, view orders)
  - _Requirements: 5.1, 5.3, 5.4, 17.4, 18.1, 18.2, 18.3, 18.4_

- [x] 10. Create admin dashboard
  - Implement admin dashboard page with role protection
  - Create admin dashboard data API endpoint
  - Build dashboard widgets for platform metrics
  - Add pending farmer approvals widget
  - _Requirements: 6.1, 6.4, 6.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 10.1 Create admin dashboard API endpoint
  - Create or update `pages/api/admin/dashboard.ts`
  - Fetch platform metrics (total orders, revenue, users, farmers)
  - Fetch pending farmer approvals
  - Fetch quality alerts
  - Return structured dashboard data
  - _Requirements: 6.5, 18.5_

- [x] 10.2 Create admin dashboard page
  - Create or update `pages/admin/dashboard.tsx`
  - Use RoleBasedLayout with allowedRoles=['ADMIN', 'OPERATIONS']
  - Fetch dashboard data from API
  - Display widgets: platform metrics, pending farmers, quality alerts
  - Add quick action buttons (manage farmers, view analytics)
  - _Requirements: 6.1, 6.4, 18.1, 18.2, 18.3, 18.4_

- [x] 11. Implement farmer approval workflow
  - Create farmer approval API endpoints
  - Add approval/rejection UI to admin farmer list
  - Implement email notifications for approval status
  - _Requirements: 6.5, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 11.1 Create farmer approval API endpoints
  - Create `pages/api/admin/farmers/[id]/approve.ts`
  - Create `pages/api/admin/farmers/[id]/reject.ts`
  - Update Farmer.isApproved field
  - Send email notification to farmer
  - Send notification to admins on new farmer registration
  - _Requirements: 17.1, 17.2, 17.5_

- [x] 11.2 Update admin farmers list page
  - Update `pages/admin/farmers.tsx` to show approval status
  - Add approve/reject buttons for pending farmers
  - Display farmer details and application information
  - Show success/error messages after approval actions
  - _Requirements: 6.5, 17.1, 17.2_

- [-] 12. Create operations dashboard
  - Implement operations-specific dashboard view
  - Restrict access to operations-allowed features only
  - Create operations dashboard widgets
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 12.1 Update admin dashboard for operations role
  - Modify `pages/admin/dashboard.tsx` to show different widgets for OPERATIONS role
  - Display operations-specific widgets: procurement, QC, routes, inventory
  - Hide admin-only widgets (user management, farmer approvals)
  - _Requirements: 7.1, 7.4, 18.1, 18.2, 18.3, 18.4_

- [x] 12.2 Restrict operations access in API routes
  - Update admin API routes to check for OPERATIONS role
  - Allow access to procurement, QC, logistics endpoints
  - Block access to user management and settings endpoints
  - _Requirements: 7.2, 7.5_

- [x] 13. Create driver dashboard
  - Implement driver dashboard page with role protection
  - Create driver dashboard data API endpoint
  - Build dashboard widgets for delivery metrics
  - _Requirements: 8.1, 8.4, 8.5, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 13.1 Create driver dashboard API endpoint
  - Create `pages/api/driver/dashboard.ts`
  - Fetch today's assigned deliveries
  - Fetch active route information
  - Fetch delivery performance stats
  - Fetch today's earnings
  - Return structured dashboard data
  - _Requirements: 8.5, 18.5_

- [x] 13.2 Create driver dashboard page
  - Create `pages/driver/dashboard.tsx`
  - Use RoleBasedLayout with allowedRoles=['DRIVER']
  - Fetch dashboard data from API
  - Display widgets: deliveries list, route map, performance, earnings
  - Add quick action buttons (view route, update delivery status)
  - _Requirements: 8.1, 8.4, 18.1, 18.2, 18.3, 18.4_

- [x] 14. Set up ML service infrastructure
  - Create Python FastAPI service structure
  - Implement ML client in Next.js
  - Set up Redis caching for predictions
  - _Requirements: 11.5, 12.5, 13.5, 14.5, 15.5_

- [x] 14.1 Create ML service client
  - Create `lib/ml-client.ts` with ML service API client
  - Implement request/response handling with timeout
  - Add error handling and fallback logic
  - Implement caching layer with Redis
  - _Requirements: 11.5, 12.5, 13.5, 14.5, 15.5_

- [x] 14.2 Create ML service configuration
  - Add ML service URL and API key to environment variables
  - Create configuration file for ML endpoints
  - Document ML service setup in README
  - _Requirements: 11.5, 12.5, 13.5, 14.5, 15.5_

- [x] 15. Implement product recommendations (AI/ML)
  - Create recommendations API endpoint
  - Integrate with ML service for collaborative filtering
  - Add recommendations widget to customer dashboard
  - Implement fallback to trending products
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 15.1 Create recommendations API endpoint
  - Create `pages/api/personalization/recommendations.ts`
  - Call ML service for recommendations
  - Implement Redis caching (1 hour TTL)
  - Add fallback to trending products if ML service unavailable
  - Return list of recommended products
  - _Requirements: 11.1, 11.2, 11.5_

- [x] 15.2 Add recommendations widget to customer dashboard
  - Update customer dashboard to fetch recommendations
  - Display "Recommended for You" widget with product cards
  - Add click tracking for recommendation improvements
  - Show loading and error states
  - _Requirements: 11.1, 11.3, 11.4_

- [x] 16. Implement demand forecasting (AI/ML)
  - Create demand forecast API endpoint
  - Integrate with ML service for time series predictions
  - Add forecast widget to farmer dashboard
  - Implement fallback to historical averages
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 16.1 Create demand forecast API endpoint
  - Create `pages/api/farmer/demand-forecast.ts`
  - Call ML service for 7-day demand predictions
  - Implement Redis caching (24 hour TTL)
  - Add fallback to moving average if ML service unavailable
  - Return forecasts with confidence intervals
  - _Requirements: 12.1, 12.2, 12.5_

- [x] 16.2 Add forecast widget to farmer dashboard
  - Update farmer dashboard to fetch demand forecasts
  - Display forecast table with product, quantity, date, confidence
  - Show trend visualization (chart or graph)
  - Display forecast accuracy metric
  - _Requirements: 12.1, 12.3, 12.4_

- [x] 17. Implement farmer approval scoring (AI/ML)
  - Create farmer scoring API endpoint
  - Integrate with ML service for application scoring
  - Add score display to admin farmer list
  - Implement rule-based fallback scoring
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 17.1 Create farmer scoring API endpoint
  - Create `pages/api/admin/farmers/score.ts`
  - Call ML service for farmer application scoring
  - Calculate score based on certifications, location, documents
  - Implement rule-based fallback if ML service unavailable
  - Return score with factor breakdown
  - _Requirements: 13.1, 13.2, 13.5_

- [x] 17.2 Add score display to admin farmer list
  - Update admin farmers page to show approval scores
  - Display score badge with color coding (green/yellow/red)
  - Show score factors on hover or expand
  - Sort farmers by score (lowest first for review priority)
  - _Requirements: 13.1, 13.3, 13.4_

- [x] 18. Implement smart search (AI/ML)
  - Create enhanced search API endpoint
  - Integrate with ML service for NLP processing
  - Add auto-complete functionality
  - Implement fuzzy matching and typo tolerance
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 18.1 Create smart search API endpoint
  - Create or update `pages/api/search/products.ts`
  - Call ML service for NLP query processing
  - Implement fuzzy matching for typo tolerance
  - Add personalized ranking based on user preferences
  - Track search queries for learning
  - _Requirements: 14.1, 14.2, 14.5_

- [x] 18.2 Add auto-complete to search component
  - Update search component to fetch suggestions as user types
  - Display auto-complete dropdown with relevant suggestions
  - Implement debouncing for API calls
  - Handle natural language queries
  - _Requirements: 14.3, 14.4_

- [x] 19. Implement route optimization (AI/ML)
  - Create route optimization API endpoint
  - Integrate with ML service for route calculation
  - Add optimized route display to driver dashboard
  - Implement basic fallback algorithm
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 19.1 Create route optimization API endpoint
  - Create `pages/api/admin/logistics/optimize-routes.ts`
  - Call ML service for route optimization
  - Consider delivery time windows and vehicle capacity
  - Implement nearest-neighbor fallback if ML service unavailable
  - Save optimization results to database
  - _Requirements: 15.1, 15.2, 15.5_

- [x] 19.2 Add optimized route to driver dashboard
  - Update driver dashboard to display optimized delivery sequence
  - Show route map with numbered stops
  - Display estimated time for each stop
  - Show total distance and time savings
  - _Requirements: 15.1, 15.3, 15.4_

- [x] 20. Implement procurement list generation
  - Create procurement generation API endpoint
  - Calculate required quantities from orders and subscriptions
  - Match with farmer availability
  - Add procurement list to admin/operations dashboard
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 20.1 Create procurement generation API endpoint
  - Create or update `pages/api/admin/procurement/generate.ts`
  - Calculate required quantities for next 3 days from orders and subscriptions
  - Match requirements with farmer products and capacity
  - Optimize for cost and quality based on farmer performance
  - Return procurement list with farmer assignments
  - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [x] 20.2 Add procurement list to dashboards
  - Update admin dashboard to display daily procurement list
  - Update operations dashboard to show procurement list
  - Add manual adjustment capability
  - Show farmer contact information for coordination
  - _Requirements: 20.1, 20.5_

- [x] 21. Add quality control integration
  - Create QC result storage and retrieval
  - Add QC results to farmer dashboard
  - Implement QC alerts for operations
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [x] 21.1 Create QC results API endpoints
  - Create endpoints to fetch QC results by farmer
  - Create endpoint to fetch recent quality alerts
  - Calculate quality score trends
  - _Requirements: 19.3, 19.4_

- [x] 21.2 Add QC results to farmer dashboard
  - Display quality score trend chart on farmer dashboard
  - Show recent QC results with pass/fail status
  - Display rejection reasons when applicable
  - _Requirements: 19.1, 19.4_

- [x] 21.3 Add QC alerts to operations dashboard
  - Display quality alerts widget on operations dashboard
  - Show products that failed QC
  - Add notification for new quality issues
  - _Requirements: 19.2, 19.5_
