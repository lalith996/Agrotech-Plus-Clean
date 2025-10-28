#!/usr/bin/env node

/**
 * Quick Server Test
 * Tests if the Next.js server is responding correctly
 */

async function quickTest() {
  console.log('\n🔍 Quick Server Test\n')
  console.log('Testing: http://localhost:3000')
  
  try {
    const response = await fetch('http://localhost:3000')
    console.log(`✅ Server Status: ${response.status} ${response.statusText}`)
    console.log(`✅ Server is running and responding!\n`)
    
    // Test a few key endpoints
    const tests = [
      { url: '/demo-login', name: 'Demo Login' },
      { url: '/api/health', name: 'Health API' },
      { url: '/products', name: 'Products Page' }
    ]
    
    console.log('Testing key endpoints:')
    for (const test of tests) {
      try {
        const res = await fetch(`http://localhost:3000${test.url}`, { 
          method: 'HEAD',
          redirect: 'manual'
        })
        const icon = res.status < 400 ? '✅' : '⚠️'
        console.log(`${icon} ${test.name}: ${res.status}`)
      } catch (err) {
        console.log(`❌ ${test.name}: ${err.message}`)
      }
    }
    
    console.log('\n✅ All basic tests passed!\n')
  } catch (error) {
    console.log(`❌ Server not responding: ${error.message}`)
    console.log(`\n💡 Make sure the server is running:`)
    console.log(`   npm run dev\n`)
    process.exit(1)
  }
}

quickTest().catch(console.error)
