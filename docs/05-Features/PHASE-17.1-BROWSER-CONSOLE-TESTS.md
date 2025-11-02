# Quick Browser Console Tests for Phase 17.1

Open the browser DevTools Console (F12) and paste these commands:

## Test 1: Check if Honeypot Field Exists

```javascript
// Check if honeypot field is present but hidden
const honeypot = document.getElementById('website');
if (honeypot) {
    console.log('✅ Honeypot field exists');
    console.log('   Hidden:', honeypot.className.includes('hidden'));
    console.log('   TabIndex:', honeypot.tabIndex);
    console.log('   AutoComplete:', honeypot.autocomplete);
} else {
    console.log('❌ Honeypot field NOT found');
}
```

## Test 2: Simulate Bot Filling Honeypot (Then Submit Form)

```javascript
// Fill the honeypot field like a bot would
document.getElementById('website').value = 'https://spam-site.com';
console.log('🤖 Honeypot field filled with:', document.getElementById('website').value);
console.log('📝 Now fill the form and click "Send Message" - should be REJECTED');
```

## Test 3: Check Security Headers

```javascript
// Fetch home page and display security headers
fetch(window.location.origin)
    .then(response => {
        console.log('Security Headers:');
        console.log('✓ X-Frame-Options:', response.headers.get('x-frame-options'));
        console.log('✓ X-Content-Type-Options:', response.headers.get('x-content-type-options'));
        console.log('✓ Referrer-Policy:', response.headers.get('referrer-policy'));
        console.log('✓ Permissions-Policy:', response.headers.get('permissions-policy'));
    });
```

## Test 4: Test Contact API Directly (Normal Submission)

```javascript
// Test normal submission (should succeed)
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        website: '' // Empty honeypot
    })
})
.then(r => r.json())
.then(data => console.log('✅ Normal submission:', data))
.catch(e => console.error('❌ Error:', e));
```

## Test 5: Test Contact API with Honeypot Filled (Bot Submission)

```javascript
// Test bot submission (should be rejected)
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Bot Name',
        email: 'bot@spam.com',
        message: 'Spam message',
        website: 'https://spam-site.com' // Filled honeypot
    })
})
.then(r => r.json())
.then(data => console.log('🤖 Bot submission response:', data))
.catch(e => console.error('❌ Error:', e));
```

---

## Expected Results

### Test 1 Output:
```
✅ Honeypot field exists
   Hidden: true
   TabIndex: -1
   AutoComplete: off
```

### Test 4 Output:
```
✅ Normal submission: { success: true, message: "Your message has been received...", id: ... }
```

### Test 5 Output:
```
🤖 Bot submission response: { error: "Invalid submission" }
```

### Test 3 Output:
```
Security Headers:
✓ X-Frame-Options: DENY
✓ X-Content-Type-Options: nosniff
✓ Referrer-Policy: strict-origin-when-cross-origin
✓ Permissions-Policy: camera=(), microphone=(), geolocation=()
```
