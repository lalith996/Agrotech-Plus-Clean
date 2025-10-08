# AgroTrack+ Test Suite

This directory contains comprehensive unit tests for the AgroTrack+ platform's data models and validation schemas.

## Test Coverage

### 1. Validation Schema Tests (`test/lib/validations.test.ts`)
- **User validation schemas**: Tests for user, customer, and farmer data validation
- **Address validation**: Tests for address format validation including Indian ZIP codes
- **Product validation**: Tests for product data validation including pricing rules
- **Subscription validation**: Tests for subscription and subscription item validation
- **Order validation**: Tests for order and order item validation
- **QC Result validation**: Tests for quality control result validation
- **Authentication schemas**: Tests for sign-up, sign-in, and password validation
- **Profile update schemas**: Tests for user and farmer profile update validation

**Total Tests: 43**

### 2. Database Operations Tests (`test/lib/db.test.ts`)
- **User operations**: Create, find, update user records
- **Customer operations**: Create customer profiles and relationships
- **Farmer operations**: Create and approve farmer profiles
- **Product operations**: Create products and find by farmer
- **Subscription operations**: Create subscriptions with items, pause subscriptions
- **Order operations**: Create orders with items, update order status
- **QC Result operations**: Create QC results, find by farmer
- **Address operations**: Create and find customer addresses

**Total Tests: 17**

### 3. Model Relationships Tests (`test/lib/model-relationships.test.ts`)
- **User-Customer relationships**: Tests for user-customer profile linking
- **User-Farmer relationships**: Tests for user-farmer profile linking
- **Customer-Subscription relationships**: Tests for subscription management
- **Order-Customer-Subscription relationships**: Tests for order creation from subscriptions
- **Product-Farmer relationships**: Tests for product-farmer associations
- **QC Results aggregation**: Tests for quality metrics calculations
- **Data integrity constraints**: Tests for unique constraints, foreign keys, required fields
- **Cascade delete operations**: Tests for data cleanup on user deletion

**Total Tests: 15**

### 4. Business Logic Tests (`test/lib/business-logic.test.ts`)
- **Subscription business rules**: Quantity validation, status transitions, total calculations
- **Order business rules**: Status progression, item calculations, delivery date validation
- **QC business rules**: Quantity relationships, quality rate calculations, rejection reasons
- **User role permissions**: Permission validation for different user types
- **Delivery zone rules**: Slot capacity, time format validation
- **Pricing rules**: Trust statement pricing, subscription pricing consistency
- **Data validation edge cases**: Decimal handling, email/phone/ZIP format validation

**Total Tests: 20**

## Test Framework

- **Testing Framework**: Vitest
- **Mocking**: Vitest built-in mocking for Prisma client
- **Assertions**: Vitest expect API with Jest-compatible matchers
- **Environment**: jsdom for DOM-related testing

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

## Test Structure

Each test file follows a consistent structure:
- **Describe blocks** for grouping related tests
- **Setup/teardown** using beforeEach/afterEach hooks
- **Mock implementations** for external dependencies
- **Comprehensive assertions** covering both success and failure cases
- **Edge case testing** for boundary conditions

## Coverage Areas

The test suite covers the following requirements from the specification:

### Requirement 1.1 (Customer Authentication)
- User validation schemas
- Authentication flow testing
- Profile management validation

### Requirement 6.1 (Farmer Profile Management)
- Farmer validation schemas
- Document validation
- Profile approval workflows

## Key Testing Patterns

1. **Schema Validation Testing**: Validates all Zod schemas with valid and invalid inputs
2. **Database Operation Testing**: Mocks Prisma operations to test CRUD functionality
3. **Relationship Testing**: Validates foreign key relationships and data integrity
4. **Business Logic Testing**: Tests domain-specific rules and calculations
5. **Edge Case Testing**: Handles boundary conditions and error scenarios

## Test Data

Tests use realistic but anonymized data that reflects the Indian agricultural context:
- Indian phone number formats (+91...)
- Indian ZIP codes (6 digits)
- Local farm names and locations
- Relevant product categories and pricing

## Maintenance

- Tests are automatically run on code changes
- Mock implementations should be updated when Prisma schema changes
- New validation schemas should have corresponding test coverage
- Business logic changes should include updated test cases