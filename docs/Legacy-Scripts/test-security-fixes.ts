/**
 * Security Fixes Test Suite
 * Tests honeypot field and security headers
 */

const BASE_URL = 'http://localhost:3001';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color: string, symbol: string, message: string) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

async function testHoneypot() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🧪', 'Testing Honeypot Field Bot Protection');
  console.log('='.repeat(60) + '\n');

  // Test 1: Normal submission (should succeed)
  log(colors.yellow, '📝', 'Test 1: Normal submission (no honeypot filled)');
  try {
    const normalResponse = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+971501234567',
        subject: 'Test inquiry',
        message: 'This is a legitimate test message for the contact form.',
        website: '', // Empty honeypot field
      }),
    });

    const normalResult = await normalResponse.json();
    
    if (normalResponse.ok) {
      log(colors.green, '✅', `Normal submission accepted (Status: ${normalResponse.status})`);
      console.log('   Response:', normalResult);
    } else {
      log(colors.red, '❌', `Normal submission failed unexpectedly (Status: ${normalResponse.status})`);
      console.log('   Response:', normalResult);
    }
  } catch (error) {
    log(colors.red, '❌', `Normal submission error: ${error}`);
  }

  console.log('');

  // Test 2: Bot submission (should be rejected)
  log(colors.yellow, '📝', 'Test 2: Bot submission (honeypot filled)');
  try {
    const botResponse = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bot Name',
        email: 'bot@spam.com',
        phone: '+1234567890',
        subject: 'Spam subject',
        message: 'This is a spam message from a bot.',
        website: 'https://spam-site.com', // Filled honeypot field (bot behavior)
      }),
    });

    const botResult = await botResponse.json();
    
    if (botResponse.status === 400 && botResult.error === 'Invalid submission') {
      log(colors.green, '✅', `Bot submission correctly rejected (Status: ${botResponse.status})`);
      console.log('   Response:', botResult);
    } else {
      log(colors.red, '❌', `Bot submission was not properly rejected (Status: ${botResponse.status})`);
      console.log('   Response:', botResult);
    }
  } catch (error) {
    log(colors.red, '❌', `Bot submission test error: ${error}`);
  }

  console.log('');
}

async function testSecurityHeaders() {
  console.log('\n' + '='.repeat(60));
  log(colors.blue, '🔒', 'Testing Security Headers');
  console.log('='.repeat(60) + '\n');

  try {
    const response = await fetch(`${BASE_URL}/`);
    const headers = response.headers;

    const expectedHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    };

    let allHeadersPresent = true;

    for (const [header, expectedValue] of Object.entries(expectedHeaders)) {
      const actualValue = headers.get(header);
      
      if (actualValue === expectedValue) {
        log(colors.green, '✅', `${header}: ${actualValue}`);
      } else if (actualValue) {
        log(colors.yellow, '⚠️', `${header}: ${actualValue} (expected: ${expectedValue})`);
      } else {
        log(colors.red, '❌', `${header}: MISSING (expected: ${expectedValue})`);
        allHeadersPresent = false;
      }
    }

    console.log('');
    if (allHeadersPresent) {
      log(colors.green, '🎉', 'All security headers present and correct!');
    } else {
      log(colors.red, '⚠️', 'Some security headers are missing or incorrect');
    }
  } catch (error) {
    log(colors.red, '❌', `Security headers test error: ${error}`);
  }

  console.log('');
}

async function runTests() {
  console.log('\n');
  log(colors.magenta, '🚀', 'Starting Phase 17.1 Security Fixes Tests');
  log(colors.magenta, '📍', `Target: ${BASE_URL}`);
  
  await testHoneypot();
  await testSecurityHeaders();
  
  console.log('\n' + '='.repeat(60));
  log(colors.magenta, '✨', 'All Tests Completed!');
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);
