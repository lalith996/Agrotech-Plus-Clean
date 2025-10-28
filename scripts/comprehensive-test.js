#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const results = { passed: [], failed: [], warnings: [] };

function testEndpoint(path, method = 'GET', expectedStatus = [200, 307, 401, 403]) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const isExpected = Array.isArray(expectedStatus) 
          ? expectedStatus.includes(res.statusCode)
          : res.statusCode === expectedStatus;
        
        resolve({
          path,
          status: res.statusCode,
          success: isExpected,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        status: 0,
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n🔍 COMPREHENSIVE BUG DETECTION\n');
  console.log('='.repeat(60));
  
  const tests = [
    // Public pages
    { path: '/', name: 'Home', expected: [200] },
    { path: '/products', name: 'Products', expected: [200] },
    { path: '/products/invalid-id', name: 'Invalid Product', expected: [404, 500] },
    { path: '/about', name: 'About', expected: [200] },
    { path: '/contact', name: 'Contact', expected: [200] },
    { path: '/faq', name: 'FAQ', expected: [200] },
    { path: '/auth/signin', name: 'Sign In', expected: [200] },
    { path: '/auth/signup', name: 'Sign Up', expected: [200] },
    
    // API endpoints
    { path: '/api/health', name: 'Health API', expected: [200, 503] },
    { path: '/api/products', name: 'Products API', expected: [200] },
    { path: '/api/farmers', name: 'Farmers API', expected: [200] },
    { path: '/api/auth/session', name: 'Session API', expected: [200] },
    
    // Protected pages (should redirect)
    { path: '/dashboard', name: 'Dashboard', expected: [307, 401] },
    { path: '/cart', name: 'Cart', expected: [307, 401] },
    { path: '/orders', name: 'Orders', expected: [307, 401] },
    
    // Edge cases
    { path: '/nonexistent-page', name: 'Non-existent Page', expected: [404] },
    { path: '/api/nonexistent', name: 'Non-existent API', expected: [404] },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.path, 'GET', test.expected);
    
    if (result.success) {
      results.passed.push({ ...test, ...result });
      console.log(`✅ ${test.name}: ${result.status}`);
    } else {
      results.failed.push({ ...test, ...result });
      console.log(`❌ ${test.name}: ${result.status} (Expected: ${test.expected.join(' or ')})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`✅ Passed: ${results.passed.length}/${tests.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${tests.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    results.failed.forEach(test => {
      console.log(`  - ${test.name} (${test.path})`);
      console.log(`    Status: ${test.status}, Expected: ${test.expected.join(' or ')}`);
      if (test.error) console.log(`    Error: ${test.error}`);
    });
  }
  
  console.log('\n');
}

runTests().catch(console.error);
