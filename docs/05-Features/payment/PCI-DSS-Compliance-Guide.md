# PCI DSS Compliance Guide

**Document Version:** 1.0  
**Last Updated:** January 11, 2025  
**Compliance Level:** SAQ A-EP (Self-Assessment Questionnaire A - E-commerce Payment)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Compliance Level](#compliance-level)
3. [Core Requirements](#core-requirements)
4. [Prohibited Practices](#prohibited-practices)
5. [Implementation Checklist](#implementation-checklist)
6. [Security Controls](#security-controls)
7. [Incident Response](#incident-response)
8. [Compliance Procedures](#compliance-procedures)
9. [Annual Review](#annual-review)

---

## 🔒 Overview

This document outlines PCI DSS (Payment Card Industry Data Security Standard) compliance requirements for our payment gateway implementation. We use Stripe as our payment processor, which is a Level 1 PCI DSS certified service provider.

### What is PCI DSS?

PCI DSS is a security standard created by major credit card companies to protect cardholder data. Compliance is **mandatory** for any business that accepts credit card payments.

### Why Compliance Matters

- **Legal Requirement:** Non-compliance can result in fines ($5,000-$100,000/month)
- **Customer Trust:** Protects customer payment data
- **Brand Protection:** Prevents data breaches and reputational damage
- **Business Continuity:** Avoids payment processor account termination

---

## 🎯 Compliance Level

### SAQ A-EP (Simplified Questionnaire)

We qualify for **SAQ A-EP** because:

1. ✅ We use a PCI DSS compliant payment processor (Stripe)
2. ✅ Cardholder data flows directly from customer browser to Stripe
3. ✅ We **never** store, process, or transmit cardholder data on our servers
4. ✅ We use Stripe.js and Elements for payment form collection
5. ✅ Payment data is tokenized before reaching our servers

**Requirements:** Only 156 questions (vs. 329 for SAQ D-Merchant)

---

## ✅ Core Requirements

### Requirement 1: Install and Maintain Network Security

**Actions:**
- Firewall configured to restrict unnecessary inbound/outbound traffic
- Server running behind secure network infrastructure
- Regular firewall rule reviews

**Implementation:**
```yaml
# Firewall Rules (Example)
Inbound:
  - Allow: HTTPS (443) from anywhere
  - Allow: HTTP (80) → redirect to HTTPS
  - Deny: All other ports by default

Outbound:
  - Allow: HTTPS to Stripe API (api.stripe.com)
  - Allow: DNS, NTP for system operations
  - Deny: All unnecessary outbound connections
```

---

### Requirement 2: Do Not Use Vendor-Supplied Defaults

**Actions:**
- Change all default passwords
- Remove unnecessary default accounts
- Disable unused services
- Use strong, unique credentials

**Checklist:**
- [ ] Database admin password changed from default
- [ ] SSH keys used instead of passwords
- [ ] Default admin accounts removed or disabled
- [ ] Unnecessary services disabled (FTP, Telnet, etc.)

---

### Requirement 3: Protect Stored Cardholder Data

**CRITICAL:** We **DO NOT** store cardholder data!

**What We Store:**
- ✅ Stripe Payment Intent ID (non-sensitive)
- ✅ Stripe Customer ID (non-sensitive)
- ✅ Last 4 digits of card (allowed by PCI DSS)
- ✅ Card brand (Visa, Mastercard, etc.)
- ✅ Expiry month/year (allowed)
- ✅ Anonymized customer data

**What We NEVER Store:**
- ❌ Full credit card numbers (PAN)
- ❌ CVV/CVC codes
- ❌ Magnetic stripe data
- ❌ PIN numbers
- ❌ CAV2/CVC2/CVV2/CID values

**Database Schema Verification:**
```sql
-- Our Payment table (COMPLIANT)
CREATE TABLE Payment (
  id TEXT PRIMARY KEY,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  transactionId TEXT NOT NULL,  -- Stripe payment_intent_id (non-sensitive)
  metadata JSONB,                -- No card data stored
  -- NO credit card data columns!
);
```

---

### Requirement 4: Encrypt Transmission of Cardholder Data

**Implementation:**
- ✅ **HTTPS/TLS 1.2+** enforced for all connections
- ✅ Stripe.js handles card data transmission
- ✅ Card data never touches our servers
- ✅ Stripe Elements with end-to-end encryption

**Code Verification:**
```typescript
// ✅ CORRECT: Card data goes directly to Stripe
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: elements.getElement(CardElement)!,
      // Card data never sent to our backend
    }
  }
);

// ❌ WRONG: Never send card data to your backend
// fetch('/api/payment', { cardNumber: '...' }); // NEVER DO THIS
```

**HTTPS Configuration:**
```nginx
# Nginx HTTPS Configuration (Example)
server {
  listen 443 ssl http2;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  # Strong TLS configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
}
```

---

### Requirement 5: Protect All Systems Against Malware

**Actions:**
- Anti-malware software installed on all systems
- Regular malware scans
- Operating system and software updates
- Security patches applied promptly

**Checklist:**
- [ ] Anti-malware installed (Windows Defender, ClamAV, etc.)
- [ ] Automatic updates enabled
- [ ] Regular security scans scheduled
- [ ] Malware definitions updated daily

---

### Requirement 6: Develop and Maintain Secure Systems

**Secure Development Lifecycle:**

1. **Code Review**
   - All payment-related code reviewed before deployment
   - Security-focused code reviews

2. **Vulnerability Scanning**
   ```bash
   # Run security audits
   npm audit
   npm audit fix
   
   # Dependency scanning
   snyk test
   ```

3. **Security Testing**
   - Penetration testing before production
   - Regular vulnerability assessments
   - OWASP Top 10 compliance

4. **Change Management**
   - Document all changes to payment system
   - Test in staging before production
   - Rollback plan for each deployment

---

### Requirement 7: Restrict Access to Cardholder Data

**We don't store cardholder data, but we restrict access to payment system:**

**Role-Based Access Control (RBAC):**
```typescript
// Only admins can access payment management
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // Full access
  ADMIN = 'ADMIN',               // Payment management
  VIEWER = 'VIEWER'              // Read-only
}

// Access control enforcement
const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
if (!isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Access Logs:**
- All payment-related actions logged
- Who accessed what and when
- Audit trail for compliance

---

### Requirement 8: Identify and Authenticate Access

**Authentication Requirements:**

1. **Multi-Factor Authentication (MFA)**
   - Required for all admin users
   - Enforced via Clerk authentication
   ```typescript
   // Clerk enforces MFA for admin roles
   ```

2. **Strong Passwords**
   - Minimum 12 characters
   - Combination of uppercase, lowercase, numbers, symbols
   - No common passwords
   - Password expiration (90 days recommended)

3. **Session Management**
   - Automatic session timeout (15 minutes idle)
   - Secure session storage
   - Re-authentication for sensitive actions

---

### Requirement 9: Restrict Physical Access

**Data Center Security:**
- Use reputable hosting providers (AWS, GCP, Azure, Vercel)
- Physical security controls managed by provider
- SOC 2 Type II certified infrastructure

**Office Security:**
- Lock computers when unattended
- Secure disposal of documents containing sensitive data
- Access logs for server rooms (if applicable)

---

### Requirement 10: Track and Monitor Access

**Logging Requirements:**

```typescript
// Example: Webhook event logging
await prisma.webhookLog.create({
  data: {
    provider: 'STRIPE',
    eventType: event.type,
    eventId: event.id,
    payload: event.data.object,
    signature,
    verified: true,
    processed: false,
    createdAt: new Date()
  }
});
```

**What We Log:**
- All API requests to payment endpoints
- Webhook events from Stripe
- Failed authentication attempts
- Refund operations
- Administrative actions
- Security events

**Log Retention:**
- Minimum 1 year retention
- 3 months immediate access
- Protected from tampering

---

### Requirement 11: Regularly Test Security

**Testing Schedule:**

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Vulnerability Scan | Quarterly | Security Team |
| Penetration Test | Annually | External Auditor |
| Code Security Review | Each Release | Dev Team |
| Dependency Audit | Monthly | Dev Team |
| Firewall Review | Quarterly | Infrastructure |

**Vulnerability Scanning:**
```bash
# Quarterly external scan (required)
# Use Approved Scanning Vendor (ASV)
# Examples: Qualys, Trustwave, Rapid7
```

---

### Requirement 12: Maintain Information Security Policy

**Security Policy Document Required:**
- Define security responsibilities
- Acceptable use policy
- Incident response procedures
- Annual security awareness training

**Required Policies:**
1. **Payment Gateway Security Policy**
2. **Access Control Policy**
3. **Incident Response Plan** (see below)
4. **Data Retention Policy**
5. **Vendor Management Policy**

---

## 🚫 Prohibited Practices

### NEVER Do These:

1. ❌ **Store Full Credit Card Numbers**
   ```typescript
   // ❌ NEVER DO THIS
   await prisma.payment.create({
     cardNumber: '4111111111111111' // ILLEGAL!
   });
   ```

2. ❌ **Store CVV/CVC Codes**
   - Not even temporarily
   - Not even encrypted
   - Never, under any circumstances

3. ❌ **Send Card Data via Email**
   - No screenshots of payment forms
   - No card numbers in support tickets

4. ❌ **Log Card Data**
   ```typescript
   // ❌ NEVER DO THIS
   console.log('Card number:', cardNumber);
   ```

5. ❌ **Store Card Data in Cookies/LocalStorage**
   ```typescript
   // ❌ NEVER DO THIS
   localStorage.setItem('card', cardNumber);
   ```

6. ❌ **Use Insecure Channels**
   - No HTTP (only HTTPS)
   - No FTP for transmitting payment data
   - No unencrypted email

7. ❌ **Share Payment Credentials**
   - Unique Stripe API keys per environment
   - Never share or hardcode keys
   - Rotate keys if compromised

---

## 📝 Implementation Checklist

### Pre-Launch Security Audit

- [ ] **Cardholder Data Flow Review**
  - [ ] Verify no card data stored in database
  - [ ] Verify no card data in logs
  - [ ] Verify Stripe.js used for card collection
  - [ ] Verify HTTPS enforced site-wide

- [ ] **Authentication & Access Control**
  - [ ] MFA enabled for admin users
  - [ ] Strong password policy enforced
  - [ ] Role-based access implemented
  - [ ] Session timeout configured

- [ ] **API Security**
  - [ ] Webhook signature verification implemented
  - [ ] Idempotency keys used
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints

- [ ] **Encryption**
  - [ ] TLS 1.2+ enforced
  - [ ] Security headers configured
  - [ ] Stripe API keys encrypted at rest
  - [ ] Database connections encrypted

- [ ] **Monitoring & Logging**
  - [ ] Audit logs enabled
  - [ ] Failed login attempts logged
  - [ ] Payment events logged
  - [ ] Log retention policy defined

- [ ] **Testing**
  - [ ] Vulnerability scan completed
  - [ ] Penetration test completed
  - [ ] Security code review done
  - [ ] Dependency audit passed

- [ ] **Documentation**
  - [ ] Security policies documented
  - [ ] Incident response plan created
  - [ ] Compliance evidence collected
  - [ ] Team training completed

---

## 🛡️ Security Controls

### Network Security

```bash
# Firewall Configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow 443/tcp  # HTTPS
ufw allow 80/tcp   # HTTP (redirect to HTTPS)
ufw enable
```

### Application Security

```typescript
// Security headers (Next.js config)
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

### Database Security

```typescript
// Encrypt sensitive settings
import { encrypt, decrypt } from '@/lib/encryption';

// Store encrypted Stripe keys
const encryptedKey = encrypt(stripeApiKey);
await prisma.siteSetting.create({
  key: 'stripe_secret_key',
  value: encryptedKey
});
```

---

## 🚨 Incident Response

### Incident Response Plan

**Phase 1: Detection**
- Monitor for suspicious activity
- Automated alerts for anomalies
- Review logs daily

**Phase 2: Containment**
1. Isolate affected systems
2. Disable compromised accounts
3. Rotate API keys/credentials
4. Document all actions

**Phase 3: Investigation**
1. Identify scope of breach
2. Collect evidence
3. Determine root cause
4. Assess impact

**Phase 4: Notification**
- Notify payment processor (Stripe) within 24 hours
- Notify affected customers per data breach laws
- Report to card brands if required
- Contact forensic investigator if needed

**Phase 5: Recovery**
1. Patch vulnerabilities
2. Restore from clean backups
3. Implement additional controls
4. Verify security restored

**Phase 6: Post-Incident**
- Conduct post-mortem
- Update security policies
- Train team on lessons learned
- Implement preventive measures

### Contact Information

**Emergency Contacts:**
```
Stripe Support: https://support.stripe.com
Security Email: security@stripe.com
Emergency Phone: (Use Stripe dashboard)

Internal Security Team:
- Name: [Your Security Lead]
- Email: security@yourcompany.com
- Phone: [Emergency Number]
```

---

## 📅 Compliance Procedures

### Monthly Tasks

- [ ] Review access logs
- [ ] Check for failed login attempts
- [ ] Run dependency vulnerability scans
- [ ] Review firewall rules

### Quarterly Tasks

- [ ] Conduct vulnerability scan (ASV)
- [ ] Review and update security policies
- [ ] Access control review (remove unused accounts)
- [ ] Backup and log retention verification

### Annual Tasks

- [ ] Complete PCI DSS SAQ A-EP questionnaire
- [ ] Conduct penetration test
- [ ] Security awareness training for all staff
- [ ] Review and update incident response plan
- [ ] Attestation of Compliance (AOC) submission
- [ ] Renew SSL/TLS certificates

---

## 📊 Annual Review

### SAQ A-EP Completion

**Timeline:**
1. **Weeks 1-2:** Internal assessment and evidence collection
2. **Week 3:** Complete questionnaire
3. **Week 4:** Submit to acquiring bank/payment processor

**Required Documents:**
- [ ] Completed SAQ A-EP
- [ ] Attestation of Compliance (AOC)
- [ ] ASV scan reports (quarterly)
- [ ] Network diagram
- [ ] List of service providers
- [ ] Policy documents

**Submission:**
- Submit to Stripe dashboard (if required)
- Provide to acquiring bank
- Keep copies for 3 years

---

## 🔗 Resources

**Official PCI DSS Resources:**
- PCI Security Standards Council: https://www.pcisecuritystandards.org
- SAQ A-EP Download: https://www.pcisecuritystandards.org/documents/PCI-DSS-v4_0-SAQ-A_EP.pdf
- Quick Reference Guide: https://www.pcisecuritystandards.org/document_library

**Stripe PCI Compliance:**
- Stripe Security: https://stripe.com/docs/security/stripe
- PCI Compliance Guide: https://stripe.com/docs/security/guide
- Certified Service Providers: https://www.visa.com/splisting/searchGrsp.do

**Tools:**
- Vulnerability Scanners: Qualys, Trustwave, Rapid7
- Security Testing: OWASP ZAP, Burp Suite
- Dependency Auditing: npm audit, Snyk

---

## ✅ Compliance Certification

**Certification Statement:**

> "I, [Name], [Title] of [Company Name], hereby certify that our payment gateway implementation complies with PCI DSS SAQ A-EP requirements. We do not store, process, or transmit cardholder data on our systems. All card data is handled directly by Stripe, a PCI DSS Level 1 certified service provider."

**Signature:** ___________________  
**Date:** ___________________

---

**Document Control:**
- **Version:** 1.0
- **Last Review:** January 11, 2025
- **Next Review:** January 11, 2026
- **Owner:** [Security Team]
- **Approved By:** [Management]
