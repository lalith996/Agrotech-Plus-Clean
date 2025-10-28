# Requirements Document

## Introduction

This document outlines the requirements for modifying the AgroTrack+ authentication system to allow customers to register and authenticate using their own real email addresses (Gmail, Yahoo, etc.) instead of system-generated email addresses. This change applies only to the CUSTOMER role, while other roles (FARMER, ADMIN, OPERATIONS, DRIVER) will continue using the existing auto-generated email system.

## Glossary

- **System**: The AgroTrack+ web application
- **Customer**: A user with the CUSTOMER role who purchases products
- **Real Email**: A user's actual personal email address (e.g., Gmail, Yahoo, Outlook)
- **Generated Email**: The existing system-generated email format (city.name.registrationNumber@role.agrotrack.com)
- **Dual Authentication**: Supporting both real emails (for customers) and generated emails (for other roles)
- **Email Verification**: The process of confirming a user owns their provided email address
- **Registration Flow**: The process of creating a new user account

## Requirements

### Requirement 1: Customer Registration with Real Email

**User Story:** As a customer, I want to register using my own email address, so that I can use an email I already have and check regularly.

#### Acceptance Criteria

1. WHEN a user selects the CUSTOMER role during registration, THE System SHALL accept a real email address as input
2. THE System SHALL validate the email format using standard email validation rules
3. THE System SHALL check if the email is already registered before creating the account
4. WHEN the email is already in use, THE System SHALL display an error message
5. THE System SHALL create a User record with the provided real email address

### Requirement 2: Customer Authentication with Real Email

**User Story:** As a customer, I want to sign in using my real email address and password, so that I can access my account easily.

#### Acceptance Criteria

1. WHEN a customer enters their real email and password on the sign-in page, THE System SHALL authenticate them successfully
2. THE System SHALL create a session with the CUSTOMER role
3. THE System SHALL redirect authenticated customers to the customer dashboard
4. WHEN credentials are invalid, THE System SHALL display an appropriate error message
5. THE System SHALL maintain backward compatibility with any existing customer accounts

### Requirement 3: Maintain Generated Emails for Other Roles

**User Story:** As a farmer, admin, operations staff, or driver, I want to continue using the auto-generated email system, so that my professional identity is maintained.

#### Acceptance Criteria

1. WHEN a user selects FARMER, ADMIN, OPERATIONS, or DRIVER role during registration, THE System SHALL generate an email address using the existing format
2. THE System SHALL continue to use the EmailRegistry for registration number management for non-customer roles
3. THE System SHALL authenticate non-customer users with their generated email addresses
4. THE System SHALL maintain all existing functionality for non-customer roles
5. THE System SHALL not require any changes to existing farmer, admin, operations, or driver accounts

### Requirement 4: Registration Form Updates

**User Story:** As a new user, I want the registration form to adapt based on my selected role, so that I provide the appropriate information.

#### Acceptance Criteria

1. WHEN a user selects the CUSTOMER role, THE System SHALL display an email input field
2. WHEN a user selects a non-customer role, THE System SHALL hide the email input field and show the email preview
3. THE System SHALL display clear labels indicating whether email is user-provided or auto-generated
4. THE System SHALL validate email format in real-time for customer registrations
5. THE System SHALL show appropriate help text for each registration type

### Requirement 5: Email Uniqueness Validation

**User Story:** As a system administrator, I want to ensure all email addresses are unique across the platform, so that there are no conflicts or security issues.

#### Acceptance Criteria

1. THE System SHALL check email uniqueness across all users regardless of role
2. WHEN a customer attempts to register with an email already in use, THE System SHALL reject the registration
3. WHEN a generated email conflicts with an existing email, THE System SHALL increment the registration number
4. THE System SHALL perform case-insensitive email comparison
5. THE System SHALL validate email uniqueness before creating the user record

### Requirement 6: Database Schema Compatibility

**User Story:** As a developer, I want the database schema to support both real and generated emails, so that the system can handle both authentication methods seamlessly.

#### Acceptance Criteria

1. THE System SHALL store both real and generated emails in the same User.email field
2. THE System SHALL maintain the User.registrationNumber field as nullable for customer accounts
3. THE System SHALL maintain the User.city field as nullable for customer accounts
4. THE System SHALL continue to populate registrationNumber and city for non-customer roles
5. THE System SHALL not require database migration for existing user records

### Requirement 7: Sign-In Page Updates

**User Story:** As a user, I want the sign-in page to work for both real emails and generated emails, so that I can log in regardless of my role.

#### Acceptance Criteria

1. THE System SHALL accept any valid email format on the sign-in page
2. THE System SHALL authenticate users with real emails (customers)
3. THE System SHALL authenticate users with generated emails (other roles)
4. THE System SHALL display appropriate error messages for invalid credentials
5. THE System SHALL not reveal whether an email exists in the system for security reasons

### Requirement 8: Welcome Email Notifications

**User Story:** As a new customer, I want to receive a welcome email at my real email address, so that I can confirm my registration and have account details.

#### Acceptance Criteria

1. WHEN a customer completes registration, THE System SHALL send a welcome email to their provided email address
2. THE System SHALL include account details and next steps in the welcome email
3. THE System SHALL not include generated email information for customer accounts
4. THE System SHALL continue sending welcome emails with generated credentials for non-customer roles
5. THE System SHALL handle email sending failures gracefully without blocking registration

### Requirement 9: Profile Display Updates

**User Story:** As a user, I want my profile to display my email address correctly, so that I can verify my account information.

#### Acceptance Criteria

1. WHEN a customer views their profile, THE System SHALL display their real email address
2. WHEN a non-customer user views their profile, THE System SHALL display their generated email with parsed components
3. THE System SHALL not display registration number or city for customer accounts
4. THE System SHALL maintain existing profile display for non-customer roles
5. THE System SHALL allow users to view but not edit their email address

### Requirement 10: Backward Compatibility

**User Story:** As a system administrator, I want existing user accounts to continue working without any changes, so that there is no disruption to current users.

#### Acceptance Criteria

1. THE System SHALL authenticate all existing users with their current credentials
2. THE System SHALL not require existing users to re-register or update their accounts
3. THE System SHALL maintain all existing sessions and user data
4. THE System SHALL support both authentication methods simultaneously
5. THE System SHALL not break any existing functionality for any role
