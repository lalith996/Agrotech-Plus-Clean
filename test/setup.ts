import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
})

// Clean up after each test
afterEach(() => {
  // Reset any mocks or test state
})

afterAll(() => {
  // Clean up resources
})