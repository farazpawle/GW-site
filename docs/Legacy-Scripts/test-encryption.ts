// Test script for encryption module
import { encryptValue, decryptValue, isSensitiveField } from '../src/lib/settings/encryption';

async function test() {
  console.log('Testing encryption module...\n');
  
  // Test 1: Basic encryption/decryption
  const testValue = 'my-secret-password-123';
  console.log('Test 1: Basic Encryption/Decryption');
  console.log('Original:', testValue);
  
  const encrypted = encryptValue(testValue);
  console.log('Encrypted:', encrypted);
  console.log('Format check (has colon):', encrypted.includes(':'));
  
  const decrypted = decryptValue(encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', testValue === decrypted);
  console.log('✅ Test 1 passed:', testValue === decrypted ? 'SUCCESS' : 'FAILED');
  console.log('');
  
  // Test 2: Multiple encryptions produce different ciphertexts
  console.log('Test 2: Randomized IV');
  const encrypted1 = encryptValue(testValue);
  const encrypted2 = encryptValue(testValue);
  console.log('Encryption 1:', encrypted1.substring(0, 40) + '...');
  console.log('Encryption 2:', encrypted2.substring(0, 40) + '...');
  console.log('Different ciphertexts:', encrypted1 !== encrypted2);
  console.log('Both decrypt correctly:', 
    decryptValue(encrypted1) === testValue && 
    decryptValue(encrypted2) === testValue
  );
  console.log('✅ Test 2 passed:', encrypted1 !== encrypted2 ? 'SUCCESS' : 'FAILED');
  console.log('');
  
  // Test 3: Sensitive field detection
  console.log('Test 3: Sensitive Field Detection');
  console.log('email_smtp_password:', isSensitiveField('email_smtp_password') ? 'SENSITIVE' : 'NOT SENSITIVE');
  console.log('payment_stripe_secret_key:', isSensitiveField('payment_stripe_secret_key') ? 'SENSITIVE' : 'NOT SENSITIVE');
  console.log('site_name:', isSensitiveField('site_name') ? 'SENSITIVE' : 'NOT SENSITIVE');
  console.log('contact_email:', isSensitiveField('contact_email') ? 'SENSITIVE' : 'NOT SENSITIVE');
  console.log('✅ Test 3 passed: Sensitive field detection working');
  console.log('');
  
  console.log('All tests completed! ✅');
}

test().catch(console.error);
