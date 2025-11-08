# Security Quick Reference Guide

Quick reference for developers working with the security features.

---

## HTML Sanitization

### Usage
```typescript
import { sanitizeHTML } from '@/lib/sanitize';

// Sanitize user-generated HTML content
const safeHTML = sanitizeHTML(userContent);

// Render in component
<div dangerouslySetInnerHTML={{ __html: safeHTML }} />
```

### Available Functions
- `sanitizeHTML(html)` - Standard sanitization for CMS content
- `stripHTML(html)` - Remove all HTML tags (plain text only)
- `sanitizeHTMLExtended(html)` - More permissive (for admin preview)
- `sanitizeForStructuredData(html)` - Minimal tags (for JSON-LD)

---

## Rate Limiting

### Apply to API Route
```typescript
import { applyRateLimit, contactRateLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = applyRateLimit(request, contactRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Continue with request...
}
```

### Available Rate Limiters
```typescript
// 5 requests per 15 minutes
authRateLimiter

// 3 requests per hour
contactRateLimiter

// 50 requests per 5 minutes
searchRateLimiter

// 10 requests per hour
uploadRateLimiter

// 100 requests per 15 minutes
apiRateLimiter

// 200 requests per 15 minutes
publicRateLimiter
```

### Custom Rate Limiter
```typescript
const customLimiter = {
  maxRequests: 20,
  windowMs: 10 * 60 * 1000, // 10 minutes
  keyPrefix: 'custom',
};

const result = applyRateLimit(request, customLimiter);
```

---

## Security Headers (next.config.ts)

Automatically applied to all routes:

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=(), microphone=()
- ✅ Content-Security-Policy: (comprehensive)

---

## CORS Configuration

Media proxy automatically restricts CORS based on environment:

**Development:**
- `http://localhost:3000`
- `http://127.0.0.1:3000`

**Production:**
- `process.env.NEXT_PUBLIC_SITE_URL`

---

## Testing Security Features

### Test XSS Protection
```typescript
// Try to inject malicious code in admin CMS
const maliciousContent = `
  <script>alert('XSS')</script>
  <img src=x onerror="alert('XSS')">
`;

// Should be stripped when rendered
```

### Test Rate Limiting
```bash
# Exceed rate limit
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","message":"Test"}'
done

# Should return 429 after limit exceeded
```

---

## Environment Variables

Required for production:

```bash
# .env.production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Common Patterns

### Validate + Sanitize + Rate Limit
```typescript
import { applyRateLimit, apiRateLimiter } from '@/lib/rate-limit';
import { sanitizeHTML } from '@/lib/sanitize';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResponse = applyRateLimit(request, apiRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;
  
  // 2. Input validation
  const body = await request.json();
  const schema = z.object({
    content: z.string().max(5000),
  });
  const data = schema.parse(body);
  
  // 3. Sanitization
  const safeContent = sanitizeHTML(data.content);
  
  // 4. Process request
  // ...
}
```

---

## Security Checklist for New Features

When adding new features:

- [ ] Validate all user inputs with Zod
- [ ] Sanitize HTML if rendering user content
- [ ] Apply rate limiting to public endpoints
- [ ] Check RBAC permissions for protected routes
- [ ] Use Prisma (no raw SQL queries)
- [ ] Test for XSS/CSRF vulnerabilities
- [ ] Add appropriate security headers
- [ ] Audit dependencies (`npm audit`)

---

## References

- Full Audit: `docs/SECURITY-AUDIT-REPORT.md`
- Implementation Summary: `docs/SECURITY-IMPROVEMENTS-SUMMARY.md`
- Rate Limit Utils: `src/lib/rate-limit.ts`
- Sanitization Utils: `src/lib/sanitize.ts`
