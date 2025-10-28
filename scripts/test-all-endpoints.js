#!/usr/bin/env node

/**
 * Comprehensive test script for all pages and API endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test results
const results = {
  pages: [],
  apis: []
};

// Helper function to make HTTP requests
function testEndpoint(path, method = 'GET') {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          success: res.statusCode < 400,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// Pages to test
const pages = [
  { name: 'Home Page', path: '/' },
  { name: 'Sign In', path: '/auth/signin' },
  { name: 'Sign Up', path: '/auth/signup' },
  { name: 'Demo Login', path: '/demo-login' },
  { name: 'Enhanced Landing', path: '/landing-enhanced' },
  { name: 'Animation Showcase', path: '/showcase' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Products', path: '/products' },
  { name: 'Cart', path: '/cart' },
  { name: 'Wishlist', path: '/wishlist' }
];

// API endpoints to test
const apis = [
  { name: 'Health Check', path: '/api/health' },
  { name: 'Session Check', path: '/api/auth/session' },
  { name: 'Products API', path: '/api/products' },
  { name: 'Customer Dashboard API', path: '/api/customer/dashboard' }
];

// Protected pages (will return 401/403 or redirect without auth)
const protectedPages = [
  { name: 'Customer Dashboard', path: '/dashboard' },
  { name: 'Farmer Dashboard', path: '/farmer/dashboard' },
  { name: 'Admin Dashboard', path: '/admin/dashboard' },
  { name: 'Profile', path: '/profile' },
  { name: 'Orders', path: '/orders' }
];

async function runTests() {
  console.log('\n🧪 TESTING ALL ENDPOINTS\n');
  console.log('=' .repeat(60));
  
  // Test public pages
  console.log('\n📄 PUBLIC PAGES\n');
  for (const page of pages) {
    const result = await testEndpoint(page.path);
    const status = result.success ? '✅' : '❌';
    const message = result.error || `HTTP ${result.status}`;
    console.log(`${status} ${page.name}: ${message}`);
    results.pages.push({ ...page, ...result });
  }

  // Test API endpoints
  console.log('\n🔌 API ENDPOINTS\n');
  for (const api of apis) {
    const result = await testEndpoint(api.path);
    const status = result.success ? '✅' : '❌';
    const message = result.error || `HTTP ${result.status}`;
    console.log(`${status} ${api.name}: ${message}`);
    results.apis.push({ ...api, ...result });
  }

  // Test protected pages (without auth)
  console.log('\n🔒 PROTECTED PAGES (without auth)\n');
  for (const page of protectedPages) {
    const result = await testEndpoint(page.path);
    // For protected pages, 401/403 or 307 redirect is expected
    const isExpected = result.status === 401 || result.status === 403 || result.status === 307 || result.status === 302;
    const status = isExpected ? '✅' : '❌';
    const message = result.error || `HTTP ${result.status}`;
    console.log(`${status} ${page.name}: ${message}`);
    results.pages.push({ ...page, ...result, expected: isExpected });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  const publicPagesSuccess = results.pages.filter(p => pages.includes(pages.find(pg => pg.path === p.path)) && p.success).length;
  const publicPagesTotal = pages.length;
  const apisSuccess = results.apis.filter(a => a.success).length;
  const apisTotal = apis.length;
  const protectedPagesExpected = results.pages.filter(p => protectedPages.includes(protectedPages.find(pg => pg.path === p.path)) && p.expected).length;
  const protectedPagesTotal = protectedPages.length;

  console.log(`Public Pages: ${publicPagesSuccess}/${publicPagesTotal} passing`);
  console.log(`API Endpoints: ${apisSuccess}/${apisTotal} passing`);
  console.log(`Protected Pages: ${protectedPagesExpected}/${protectedPagesTotal} behaving correctly`);
  
  const allPassing = publicPagesSuccess === publicPagesTotal && 
                     apisSuccess === apisTotal && 
                     protectedPagesExpected === protectedPagesTotal;
  
  if (allPassing) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Please review the output above.');
  }
  
  console.log('\n');
}

// Run tests
runTests().catch(console.error);
