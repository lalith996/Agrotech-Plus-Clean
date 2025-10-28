# Implementation Plan

This implementation plan breaks down the customer real email feature into discrete, actionable coding tasks. Each task builds incrementally, with all code integrated and functional at each step.

## Task List

- [x] 1. Update registration API to support dual email modes
  - Modify registration endpoint to handle both real emails (customers) and generated emails (other roles)
  - Update validation schema with conditional requirements
  - Add role-based branching logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 1.1 Update Zod validation schema
  - Modify `pages/api/auth/register.ts` to make email and city conditional based on role
  - Add custom refinement to validate CUSTOMER has email, other roles have city
  - Update error messages for clarity
  - _Requirements: 1.1, 1.2, 3.1, 4.1, 4.2, 5.1_

- [x] 1.2 Implement role-based email handling
  - Add conditional logic: if CUSTOMER use provided email, else generate email
  - For customers: normalize email (lowercase, trim) and check uniqueness
  - For other roles: call emailGenerator.generateEmail() as before
  - Store appropriate values in city and registrationNumber fields (null for customers)
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [x] 1.3 Update welcome email function
  - Modify sendWelcomeEmail to send different content based on role
  - For customers: send simple welcome email without credentials
  - For other roles: send existing email with generated credentials
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Update registration form component
  - Modify registration form to show different fields based on selected role
  - Add conditional rendering for email input (customers) vs city selector (other roles)
  - Update email preview logic
  - Update success message display
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.1 Add conditional field rendering
  - Update `pages/auth/register.tsx` to show email input when role is CUSTOMER
  - Show city selector when role is not CUSTOMER
  - Add appropriate labels and help text for each field
  - Implement real-time email format validation for customers
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.2 Update email preview display
  - Show email preview only for non-customer roles
  - Hide preview for customer role (they see their own email input)
  - Update preview text to clarify it's auto-generated
  - _Requirements: 4.3, 4.5_

- [x] 2.3 Update success message
  - Show different success messages based on role
  - For customers: simple confirmation with their email
  - For other roles: show generated email with save instructions
  - Update redirect timing and messaging
  - _Requirements: 1.5, 2.5, 8.1_

- [x] 3. Update email display components
  - Modify header and profile components to display emails correctly for both types
  - Add logic to detect email type and format display accordingly
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3.1 Update RoleBasedHeader email display
  - Modify `components/layout/role-based-header.tsx` to check if email is generated format
  - For generated emails: show parsed components (city, name, number)
  - For real emails: show email as-is without parsing
  - Use role to determine display strategy
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3.2 Update profile page email display
  - Update profile page to show email appropriately based on type
  - For customers: show real email without additional info
  - For other roles: show generated email with parsed details
  - Ensure email is displayed but not editable
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4. Update sign-in page messaging
  - Update placeholder text and help text to be generic for both email types
  - Ensure sign-in works for both real and generated emails
  - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4.1 Update sign-in form labels
  - Modify `pages/auth/signin.tsx` to use generic email placeholder
  - Update help text to indicate both email types are accepted
  - Ensure form validation accepts both formats
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 5. Test registration and authentication flows
  - Test customer registration with various email providers
  - Test other role registrations (ensure no regression)
  - Test authentication with both email types
  - Test email display in various components
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 9.1, 9.2, 10.1, 10.2, 10.3, 10.4, 10.5_



- [ ]* 5.2 Test other role registration (regression)
  - Register as farmer, admin, operations, driver
  - Verify email generation still works
  - Verify email preview displays correctly
  - Verify welcome email includes generated credentials
  - Verify sign-in works with generated email
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.2, 10.3_

- [ ]* 5.3 Test authentication flows
  - Sign in as customer with real email
  - Sign in as farmer with generated email
  - Test case-insensitive email lookup
  - Test invalid credentials handling
  - Verify role-based redirects work correctly
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.3, 10.1, 10.2_

- [ ]* 5.4 Test email display
  - View customer profile and header (should show real email)
  - View farmer profile and header (should show parsed email)
  - Verify email display is correct in all components
  - Test with various email formats
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 5.5 Test edge cases
  - Customer provides email in generated format (should work as real email)
  - Email with uppercase letters (should normalize)
  - Very long email addresses
  - Special characters in email
  - _Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_
