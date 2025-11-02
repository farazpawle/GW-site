# Phase 17.1 Security Fixes - Manual Testing Guide

**Server Status:** ✅ Running on http://localhost:3001
**Date:** November 2, 2025

---

## Test 1: Honeypot Field Bot Protection

### Test 1A: Normal Submission (Should Succeed)

1. **Open:** http://localhost:3001/contact
2. **Fill in the form:**
   - Name: John Doe
   - Email: test@example.com
   - Phone: +971501234567
   - Subject: Test Inquiry
   - Message: This is a test message for the contact form.
3. **DO NOT** open DevTools or modify hidden fields
4. **Click:** "Send Message"
5. **Expected Result:** ✅ Success message: "Thank you for your message. We will get back to you soon!"

---

### Test 1B: Bot Submission (Should Fail)

1. **Open:** http://localhost:3001/contact
2. **Open DevTools:** Press F12
3. **Go to Console tab**
4. **Run this code** to fill the honeypot field:
   ```javascript
   document.getElementById('website').value = 'https://spam-site.com';
   ```
5. **Fill in the form** with any data:
   - Name: Bot Name
   - Email: bot@spam.com
   - Message: Spam message
6. **Click:** "Send Message"
7. **Expected Result:** ❌ Error message: "Invalid submission" (400 Bad Request)

---

## Test 2: Security Headers

1. **Open:** http://localhost:3001/ (home page)
2. **Open DevTools:** Press F12
3. **Go to Network tab**
4. **Refresh the page:** Press F5
5. **Click on the first request** (the HTML document)
6. **Click "Headers" tab** in the right panel
7. **Scroll to "Response Headers"**
8. **Verify these headers are present:**
   - ✅ `x-frame-options: DENY`
   - ✅ `x-content-type-options: nosniff`
   - ✅ `referrer-policy: strict-origin-when-cross-origin`
   - ✅ `permissions-policy: camera=(), microphone=(), geolocation=()`

---

## Test 3: Environment Validation

### Test 3A: Missing Environment Variable (Should Fail)

1. **Stop the server:** Ctrl+C in terminal
2. **Backup .env.local:**
   ```powershell
   Copy-Item ".env.local" ".env.local.backup"
   ```
3. **Edit .env.local** and comment out DATABASE_URL:
   ```bash
   # DATABASE_URL="postgresql://..."
   ```
4. **Try to start server:**
   ```powershell
   npm run dev
   ```
5. **Expected Result:** ❌ Clear error message:
   ```
   ❌ Environment variable validation failed:
   Missing or invalid environment variables:
     - DATABASE_URL: DATABASE_URL must be a valid URL
   
   Please check your .env.local file...
   ```
6. **Restore .env.local:**
   ```powershell
   Copy-Item ".env.local.backup" ".env.local"
   Remove-Item ".env.local.backup"
   ```

---

## Test Results Checklist

### Honeypot Field
- [ ] Test 1A: Normal submission succeeded
- [ ] Test 1B: Bot submission rejected with "Invalid submission" error
- [ ] Server logs show "🤖 Bot detected via honeypot field"

### Security Headers
- [ ] `x-frame-options: DENY` present
- [ ] `x-content-type-options: nosniff` present
- [ ] `referrer-policy: strict-origin-when-cross-origin` present
- [ ] `permissions-policy: camera=(), microphone=(), geolocation=()` present

### Environment Validation
- [ ] Missing DATABASE_URL causes clear error message
- [ ] Server starts normally with all env vars present

---

## Screenshots to Take (Optional)

1. Contact form normal submission success
2. Contact form bot submission rejection
3. Browser DevTools showing security headers
4. Terminal showing environment validation error

---

## Notes

- **Honeypot Field:** The "website" input is hidden using `className="hidden"` and should not be visible in the browser
- **Security Headers:** These protect against clickjacking, MIME sniffing, and unauthorized API access
- **Environment Validation:** Prevents server from starting with missing critical configuration

---

**Status:** Ready for manual testing
**Next Step:** Complete the checklist above and mark tests as passed/failed
