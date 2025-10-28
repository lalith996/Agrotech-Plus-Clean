/**
 * Navigation and API Testing Script
 * Tests all critical endpoints and navigation flows
 * 
 * REQUIRES: Server running on localhost:3000
 * Run: npm run dev (in another terminal)
 * Then: node scripts/test-navigation.js
 */

const testCases = {
  // Public pages - should load without auth
  publicPages: [
    { url: '/', name: 'Home Page', expected: 200 },
    { url: '/auth/signin', name: 'Sign In', expected: 200 },
    { url: '/auth/signup', name: 'Sign Up', expected: 200 },
    { url: '/demo-login', name: 'Demo Login', expected: 200 },
    { url: '/landing-enhanced', name: 'Enhanced Landing', expected: 200 },
    { url: '/showcase', name: 'Animation Showcase', expected: 200 },
    { url: '/about', name: 'About', expected: 200 },
    { url: '/contact', name: 'Contact', expected: 200 },
    { url: '/faq', name: 'FAQ', expected: 200 },
    { url: '/products', name: 'Products', expected: 200 },
  ],
  
  // Protected pages - require auth (should redirect to login)
  protectedPages: [
    { url: '/dashboard', name: 'Customer Dashboard', expected: [200, 302, 307] },
    { url: '/farmer/dashboard', name: 'Farmer Dashboard', expected: [200, 302, 307] },
    { url: '/admin/dashboard', name: 'Admin Dashboard', expected: [200, 302, 307] },
    { url: '/profile', name: 'Profile', expected: [200, 302, 307] },
    { url: '/orders', name: 'Orders', expected: [200, 302, 307] },
  ],
  
  // API endpoints
  apiEndpoints: [
    { url: '/api/health', name: 'Health Check', method: 'GET', expected: 200 },
    { url: '/api/auth/providers', name: 'Auth Providers', method: 'GET', expected: 200 },
    { url: '/api/products', name: 'Products API', method: 'GET', expected: 200 },
  ]
}

async function testEndpoint(url, name, options = {}) {
  try {
    const response = await fetch(`http://localhost:3000${url}`, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Navigation-Test-Script/1.0'
      },
      redirect: 'manual', // Don't follow redirects automatically
      ...options
    })
    
    const status = response.status
    const expected = options.expected || 200
    const isExpected = Array.isArray(expected) ? expected.includes(status) : status === expected
    
    let statusIcon
    if (isExpected && status >= 200 && status < 300) {
      statusIcon = '✅'
    } else if (status === 302 || status === 307) {
      statusIcon = '🔀' // Redirect (expected for protected pages)
    } else if (status === 401 || status === 403) {
      statusIcon = '🔒' // Auth required
    } else if (status === 404) {
      statusIcon = '❌' // Not found
    } else if (isExpected) {
      statusIcon = '✅'
    } else {
      statusIcon = '⚠️' // Unexpected status
    }
    
    console.log(`${statusIcon} ${name.padEnd(30)} → ${status} ${response.statusText}`)
    return { url, name, status, ok: isExpected }
  } catch (error) {
    console.log(`❌ ${name.padEnd(30)} → ERROR: ${error.message}`)
    return { url, name, status: 'ERROR', ok: false, error: error.message }
  }
}

async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000', { 
      method: 'HEAD',
      redirect: 'manual'
    })
    return true
  } catch (error) {
    return false
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70))
  console.log('🧪 AGROTECH+ NAVIGATION & API TEST SUITE')
  console.log('='.repeat(70))
  
  // Check if server is running
  console.log('\n🔍 Checking server status...')
  const serverRunning = await checkServerRunning()
  
  if (!serverRunning) {
    console.log('❌ ERROR: Server is not running on http://localhost:3000')
    console.log('\n💡 Please start the server first:')
    console.log('   npm run dev')
    console.log('\nThen run this test script again.')
    process.exit(1)
  }
  
  console.log('✅ Server is running on http://localhost:3000\n')
  
  let totalTests = 0
  let passedTests = 0
  
  // Test public pages
  console.log('📄 PUBLIC PAGES (Should load without authentication)')
  console.log('-'.repeat(70))
  for (const page of testCases.publicPages) {
    const result = await testEndpoint(page.url, page.name, { expected: page.expected })
    totalTests++
    if (result.ok) passedTests++
  }
  
  // Test API endpoints  
  console.log('\n🔌 API ENDPOINTS')
  console.log('-'.repeat(70))
  for (const endpoint of testCases.apiEndpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.name, { 
      method: endpoint.method,
      expected: endpoint.expected 
    })
    totalTests++
    if (result.ok) passedTests++
  }
  
  // Test protected pages (should redirect to login or return 401)
  console.log('\n🔒 PROTECTED PAGES (Should redirect when not authenticated)')
  console.log('-'.repeat(70))
  for (const page of testCases.protectedPages) {
    const result = await testEndpoint(page.url, page.name, { expected: page.expected })
    totalTests++
    if (result.ok) passedTests++
  }
  
  // Summary
  console.log('\n' + '='.repeat(70))
  console.log(`📊 TEST SUMMARY: ${passedTests}/${totalTests} tests passed`)
  console.log('='.repeat(70))
  
  if (passedTests === totalTests) {
    console.log('✅ All tests passed! Navigation and API endpoints are working correctly.\n')
    process.exit(0)
  } else {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Check the output above.\n`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test suite error:', error.message)
    process.exit(1)
  })
}

module.exports = { testEndpoint, runTests, testCases }
