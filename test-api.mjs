#!/usr/bin/env node
/**
 * Test script for WhatsApp Reminder API
 * Uses tRPC HTTP format to test endpoints
 */

const BASE_URL = 'http://localhost:3000'

async function testRegister() {
  const email = `test${Date.now()}@example.com`
  const input = {
    email,
    password: 'password123',
    phoneNumber: '+1234567890'
  }

  console.log('📝 Testing REGISTER...')
  console.log('   Email:', email)

  try {
    const response = await fetch(`${BASE_URL}/api/trpc/auth.register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.log('❌ Register failed')
      console.log('   Status:', response.status)
      console.log('   Response:', JSON.stringify(data, null, 2))
      return null
    }

    if (data.result?.data?.token) {
      console.log('✅ Register works!')
      return { token: data.result.data.token, email, user: data.result.data.user }
    } else if (data.token) {
      console.log('✅ Register works!')
      return { token: data.token, email, user: data.user }
    } else {
      console.log('❌ Register failed - no token in response')
      console.log('   Response:', JSON.stringify(data, null, 2))
      return null
    }
  } catch (error) {
    console.log('❌ Register failed with error')
    console.log('   Error:', error.message)
    return null
  }
}

async function testLogin(email, password = 'password123') {
  console.log('\n🔐 Testing LOGIN...')
  console.log('   Email:', email)

  try {
    const response = await fetch(`${BASE_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.log('❌ Login failed')
      console.log('   Status:', response.status)
      console.log('   Response:', JSON.stringify(data, null, 2))
      return false
    }

    if (data.result?.data?.token || data.token) {
      console.log('✅ Login works!')
      return true
    } else {
      console.log('❌ Login failed - no token in response')
      console.log('   Response:', JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    console.log('❌ Login failed with error')
    console.log('   Error:', error.message)
    return false
  }
}

async function checkServer() {
  console.log('🔍 Checking if server is running...')
  try {
    const response = await fetch(BASE_URL, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    console.log('✅ Server is running\n')
    return true
  } catch (error) {
    console.log('❌ Server is NOT running on port 3000\n')
    console.log('Please start the server first:')
    console.log('  pnpm dev\n')
    return false
  }
}

async function main() {
  console.log('🧪 Testing WhatsApp Reminder API')
  console.log('================================\n')

  if (!await checkServer()) {
    process.exit(1)
  }

  const registerResult = await testRegister()
  if (!registerResult) {
    process.exit(1)
  }

  const loginSuccess = await testLogin(registerResult.email)
  if (!loginSuccess) {
    process.exit(1)
  }

  console.log('\n✅ All tests passed!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
