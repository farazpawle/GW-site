# Phase 9: Site Settings System

**Status:** 📋 Planned  
**Priority:** LOW (Configuration Feature)  
**Started:** Not yet  
**Estimated Time:** 2-3 hours  
**Completion:** 0%

---

## 🎯 Goal

Build a centralized site settings system that allows admins to configure global site properties, contact information, business details, SEO settings, email configuration, payment gateways, and shipping rules without code changes.

**What Success Looks Like:**
- ✅ Single settings management interface
- ✅ Store configuration in database (not hardcoded)
- ✅ Easy-to-use form interface
- ✅ Settings categories (General, Contact, SEO, Email, etc.)
- ✅ Validation and error handling
- ✅ Auto-save or manual save
- ✅ Settings audit trail (who changed what, when)

---

## 📋 Tasks

### Task 1: Create Settings Database Schema
**Time:** 20 minutes

**Actions:**
- Add Settings model to Prisma schema
- Run migration
- Seed default settings

**Database Schema:**
```prisma
model Settings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  category  SettingsCategory
  updatedBy String?
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

enum SettingsCategory {
  GENERAL
  CONTACT
  SEO
  EMAIL
  PAYMENT
  SHIPPING
}
```

**Files to Create:**
- `prisma/schema.prisma` - Add Settings model
- `prisma/migrations/XXX_add_settings/migration.sql` - Migration
- `scripts/seed-settings.ts` - Seed default settings

**Default Settings to Seed:**
```typescript
const defaultSettings = [
  // GENERAL
  { key: 'site_name', value: 'Garrit Wulf Auto Parts', category: 'GENERAL' },
  { key: 'site_tagline', value: 'Quality Auto Parts & Service', category: 'GENERAL' },
  { key: 'site_logo_url', value: '/images/GW_LOGO-removebg.png', category: 'GENERAL' },
  { key: 'site_timezone', value: 'America/New_York', category: 'GENERAL' },
  { key: 'site_currency', value: 'USD', category: 'GENERAL' },
  
  // CONTACT
  { key: 'contact_email', value: 'info@garritwulf.com', category: 'CONTACT' },
  { key: 'contact_phone', value: '+1 (555) 123-4567', category: 'CONTACT' },
  { key: 'contact_address', value: '123 Main St, City, State 12345', category: 'CONTACT' },
  { key: 'business_hours', value: 'Mon-Fri: 9am-6pm, Sat: 10am-4pm', category: 'CONTACT' },
  
  // SEO
  { key: 'seo_title', value: 'Garrit Wulf - Quality Auto Parts', category: 'SEO' },
  { key: 'seo_description', value: 'Professional auto parts and repair services...', category: 'SEO' },
  { key: 'seo_keywords', value: 'auto parts, car repair, brakes, engines', category: 'SEO' },
  { key: 'seo_og_image', value: '/images/og-image.jpg', category: 'SEO' },
  
  // EMAIL (SMTP)
  { key: 'email_smtp_host', value: 'smtp.gmail.com', category: 'EMAIL' },
  { key: 'email_smtp_port', value: '587', category: 'EMAIL' },
  { key: 'email_smtp_user', value: '', category: 'EMAIL' },
  { key: 'email_smtp_password', value: '', category: 'EMAIL' }, // Encrypted
  { key: 'email_from_address', value: 'noreply@garritwulf.com', category: 'EMAIL' },
  { key: 'email_from_name', value: 'Garrit Wulf Auto Parts', category: 'EMAIL' },
  
  // PAYMENT
  { key: 'payment_enabled', value: 'false', category: 'PAYMENT' },
  { key: 'payment_gateway', value: 'stripe', category: 'PAYMENT' }, // stripe, paypal, square
  { key: 'payment_stripe_public_key', value: '', category: 'PAYMENT' },
  { key: 'payment_stripe_secret_key', value: '', category: 'PAYMENT' }, // Encrypted
  
  // SHIPPING
  { key: 'shipping_enabled', value: 'true', category: 'SHIPPING' },
  { key: 'shipping_flat_rate', value: '10.00', category: 'SHIPPING' },
  { key: 'shipping_free_over', value: '100.00', category: 'SHIPPING' },
  { key: 'shipping_international', value: 'false', category: 'SHIPPING' }
]
```

---

### Task 2: Create Settings API Routes
**Time:** 30 minutes

**Features:**
- GET /api/admin/settings - Get all settings (or by category)
- GET /api/admin/settings/[key] - Get specific setting
- PUT /api/admin/settings/[key] - Update setting
- PUT /api/admin/settings/bulk - Bulk update settings

**Files to Create:**
- `src/app/api/admin/settings/route.ts` - List/bulk update
- `src/app/api/admin/settings/[key]/route.ts` - Get/update single setting
- `src/lib/settings/settings-manager.ts` - Settings helper functions

**API Route Example:**
```typescript
// GET /api/admin/settings?category=GENERAL
export async function GET(req: Request) {
  await requireAdmin()
  
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  
  const settings = await prisma.settings.findMany({
    where: category ? { category: category as SettingsCategory } : {},
    orderBy: { key: 'asc' }
  })
  
  // Convert to key-value object
  const settingsObj = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, string>)
  
  return NextResponse.json(settingsObj)
}

// PUT /api/admin/settings/bulk
export async function PUT(req: Request) {
  const user = await requireAdmin()
  const updates = await req.json() // { key: value, key2: value2 }
  
  // Update multiple settings
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value), updatedBy: user.id },
        create: { key, value: String(value), category: 'GENERAL', updatedBy: user.id }
      })
    )
  )
  
  return NextResponse.json({ success: true })
}
```

---

### Task 3: Create Settings Management UI
**Time:** 45 minutes

**Features:**
- Settings page at /admin/settings
- Tabbed interface:
  - General
  - Contact Info
  - SEO
  - Email Configuration
  - Payment Gateway
  - Shipping Rules
- Form fields for each setting
- Save button (with loading state)
- Success/error toast notifications

**Files to Create:**
- `src/app/admin/settings/page.tsx` - Settings management page
- `src/components/admin/settings/SettingsForm.tsx` - Main form component
- `src/components/admin/settings/SettingsTabs.tsx` - Tab navigation
- `src/components/admin/settings/GeneralSettings.tsx` - General tab
- `src/components/admin/settings/ContactSettings.tsx` - Contact tab
- `src/components/admin/settings/SEOSettings.tsx` - SEO tab
- `src/components/admin/settings/EmailSettings.tsx` - Email tab
- `src/components/admin/settings/PaymentSettings.tsx` - Payment tab
- `src/components/admin/settings/ShippingSettings.tsx` - Shipping tab

---

### Task 4: Build General Settings Tab
**Time:** 15 minutes

**Fields:**
- Site Name (text)
- Site Tagline (text)
- Logo URL (text or image upload)
- Timezone (select)
- Currency (select: USD, EUR, GBP, etc.)

**Files to Create:**
- `src/components/admin/settings/GeneralSettings.tsx`

---

### Task 5: Build Contact Settings Tab
**Time:** 15 minutes

**Fields:**
- Contact Email (email)
- Contact Phone (tel)
- Business Address (textarea)
- Business Hours (textarea)
- Social Media Links (text fields for Facebook, Twitter, Instagram, etc.)

**Files to Create:**
- `src/components/admin/settings/ContactSettings.tsx`

---

### Task 6: Build SEO Settings Tab
**Time:** 15 minutes

**Fields:**
- SEO Title (text)
- SEO Description (textarea, 160 chars)
- SEO Keywords (text)
- OG Image URL (text or image upload)
- Favicon URL (text or image upload)
- Google Analytics ID (text)
- Google Tag Manager ID (text)

**Files to Create:**
- `src/components/admin/settings/SEOSettings.tsx`

---

### Task 7: Build Email Settings Tab
**Time:** 15 minutes

**Fields:**
- SMTP Host (text)
- SMTP Port (number)
- SMTP Username (text)
- SMTP Password (password, masked)
- From Email Address (email)
- From Name (text)
- Test Email button (sends test email)

**Files to Create:**
- `src/components/admin/settings/EmailSettings.tsx`
- `src/app/api/admin/settings/test-email/route.ts` - Send test email

**Security Note:** SMTP password should be encrypted before storing in database.

---

### Task 8: Build Payment Settings Tab (Optional)
**Time:** 10 minutes

**Fields:**
- Enable Payments (toggle)
- Payment Gateway (select: Stripe, PayPal, Square)
- Stripe Public Key (text)
- Stripe Secret Key (password, masked)
- Test Mode (toggle)

**Files to Create:**
- `src/components/admin/settings/PaymentSettings.tsx`

---

### Task 9: Build Shipping Settings Tab (Optional)
**Time:** 10 minutes

**Fields:**
- Enable Shipping (toggle)
- Flat Rate Shipping ($)
- Free Shipping Over ($)
- International Shipping (toggle)
- Shipping Zones (advanced, optional)

**Files to Create:**
- `src/components/admin/settings/ShippingSettings.tsx`

---

### Task 10: Create Settings Helper Library
**Time:** 20 minutes

**Features:**
- Helper functions to get/set settings easily:
  - `getSetting(key)` - Get single setting
  - `getSettings(category?)` - Get all settings or by category
  - `updateSetting(key, value)` - Update single setting
  - `updateSettings(updates)` - Bulk update
- Cache settings in memory (with TTL)

**Files to Create:**
- `src/lib/settings/settings-manager.ts` - Settings helper

**Example Usage:**
```typescript
import { getSetting, getSettings, updateSetting } from '@/lib/settings/settings-manager'

// Get single setting
const siteName = await getSetting('site_name')

// Get all general settings
const generalSettings = await getSettings('GENERAL')

// Update setting
await updateSetting('site_name', 'New Site Name', user.id)
```

---

### Task 11: Apply Settings Across Site
**Time:** 20 minutes

**Actions:**
- Use settings in Layout component (site name, logo, etc.)
- Use settings in SEO meta tags
- Use settings in Footer (contact info, social links)
- Use settings in Contact page

**Files to Update:**
- `src/app/layout.tsx` - SEO meta tags from settings
- `src/components/Header.tsx` - Site name/logo from settings
- `src/components/Footer.tsx` - Contact info from settings
- `src/app/contact/page.tsx` - Contact details from settings

**Example (Layout):**
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const seoTitle = await getSetting('seo_title')
  const seoDescription = await getSetting('seo_description')
  const seoOgImage = await getSetting('seo_og_image')
  
  return {
    title: seoTitle || 'Garrit Wulf',
    description: seoDescription || 'Quality Auto Parts',
    openGraph: {
      images: [seoOgImage || '/images/og-image.jpg']
    }
  }
}
```

---

### Task 12: Add Settings Audit Trail (Optional)
**Time:** 15 minutes

**Features:**
- Log all settings changes
- Show who changed what and when
- Display on settings page

**Files to Create:**
- `src/app/api/admin/settings/audit-log/route.ts` - Audit log API
- `src/components/admin/settings/SettingsAuditLog.tsx` - Audit log display

**Database Schema Addition:**
```prisma
model SettingsAuditLog {
  id        String   @id @default(cuid())
  settingKey String
  oldValue  String?  @db.Text
  newValue  String   @db.Text
  changedBy String
  user      User     @relation(fields: [changedBy], references: [id])
  createdAt DateTime @default(now())
}
```

---

### Task 13: Polish & Test
**Time:** 15 minutes

**Actions:**
- Test all settings save correctly
- Test settings appear on frontend
- Verify security (only admins can access)
- Test SMTP email sending (if configured)
- Responsive design check
- Loading states
- Error handling
- Input validation

---

## 📁 Files Structure

```
src/
├── app/
│   └── admin/
│       └── settings/
│           └── page.tsx                   (NEW) Settings management
│
├── components/admin/
│   └── settings/
│       ├── SettingsForm.tsx               (NEW) Main form
│       ├── SettingsTabs.tsx               (NEW) Tab navigation
│       ├── GeneralSettings.tsx            (NEW) General tab
│       ├── ContactSettings.tsx            (NEW) Contact tab
│       ├── SEOSettings.tsx                (NEW) SEO tab
│       ├── EmailSettings.tsx              (NEW) Email tab
│       ├── PaymentSettings.tsx            (NEW) Payment tab
│       ├── ShippingSettings.tsx           (NEW) Shipping tab
│       └── SettingsAuditLog.tsx           (NEW) Audit log
│
├── app/api/admin/
│   └── settings/
│       ├── route.ts                       (NEW) List/bulk update
│       ├── [key]/
│       │   └── route.ts                   (NEW) Get/update single
│       ├── test-email/
│       │   └── route.ts                   (NEW) Test email
│       └── audit-log/
│           └── route.ts                   (NEW) Audit log
│
├── lib/settings/
│   └── settings-manager.ts                (NEW) Helper functions
│
└── scripts/
    └── seed-settings.ts                   (NEW) Seed default settings
```

---

## 🎨 Design Specifications

### Settings Page Layout
```
┌────────────────────────────────────────────────────────┐
│  Site Settings                              [Save All] │
├────────────────────────────────────────────────────────┤
│  [General] [Contact] [SEO] [Email] [Payment] [Shipping]│
├────────────────────────────────────────────────────────┤
│                                                         │
│  General Settings                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Site Name:          [Garrit Wulf Auto Parts___]  │ │
│  │ Site Tagline:       [Quality Auto Parts________]  │ │
│  │ Logo URL:           [/images/logo.png_________]  │ │
│  │ Timezone:           [America/New_York ▼]         │ │
│  │ Currency:           [USD ▼]                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  Recent Changes                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ • site_name changed by John Doe (2 hours ago)    │ │
│  │ • seo_description changed by Sarah (yesterday)   │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Tabs Design
```typescript
const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck }
]
```

---

## 🔧 Technical Requirements

### Settings Encryption (Sensitive Fields)
For sensitive fields like SMTP passwords, API keys:
```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY! // 32 bytes
const IV_LENGTH = 16

export function encryptValue(value: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(value)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decryptValue(encrypted: string): string {
  const parts = encrypted.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encryptedText = Buffer.from(parts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
```

### Settings Cache
```typescript
import NodeCache from 'node-cache'

const settingsCache = new NodeCache({ stdTTL: 300 }) // 5 min cache

export async function getCachedSettings(category?: string) {
  const cacheKey = category || 'all'
  
  let settings = settingsCache.get(cacheKey)
  if (settings) return settings
  
  settings = await fetchSettingsFromDB(category)
  settingsCache.set(cacheKey, settings)
  
  return settings
}
```

---

## ✅ Acceptance Criteria

**Functional Requirements:**
- [ ] All settings saved correctly
- [ ] Settings persisted in database
- [ ] Settings applied across site (frontend)
- [ ] Sensitive fields encrypted
- [ ] Test email sends successfully
- [ ] SEO meta tags updated
- [ ] Contact info displayed correctly

**Non-Functional Requirements:**
- [ ] Only admins can access /admin/settings
- [ ] API routes protected
- [ ] Settings cached for performance
- [ ] Form validation works
- [ ] No console errors

**User Experience:**
- [ ] Clear tab navigation
- [ ] Success/error notifications
- [ ] Loading states
- [ ] Helpful field descriptions
- [ ] Audit trail visible

---

## 🐛 Known Challenges

### Challenge 1: Sensitive Data Storage
**Issue:** SMTP passwords, API keys stored in plain text  
**Solution:** Encrypt sensitive fields before storing, decrypt when retrieving

### Challenge 2: Settings Cache Invalidation
**Issue:** Settings updated but old cached values returned  
**Solution:** Clear cache on settings update, use short TTL (5 min)

### Challenge 3: SEO Meta Tags Not Updating
**Issue:** Settings changed but meta tags still show old values  
**Solution:** Settings are fetched server-side in generateMetadata(), ensure cache is cleared

---

## 💡 Future Enhancements

- [ ] Import/Export settings (JSON file)
- [ ] Settings backup/restore
- [ ] Settings versioning (rollback)
- [ ] Environment-specific settings (dev, staging, prod)
- [ ] Settings validation rules
- [ ] Settings templates (presets)
- [ ] Multi-language settings
- [ ] Settings permissions (who can edit what)
- [ ] Settings webhook (notify external services on change)
- [ ] Settings CLI tool
- [ ] Advanced shipping rules (weight-based, zone-based)
- [ ] Tax configuration
- [ ] Maintenance mode toggle

---

## 📊 Progress Tracking

| Task | Estimated | Actual | Status |
|------|-----------|--------|--------|
| Settings Schema | 20 min | - | ⬜ Not started |
| Settings API Routes | 30 min | - | ⬜ Not started |
| Settings Management UI | 45 min | - | ⬜ Not started |
| General Settings Tab | 15 min | - | ⬜ Not started |
| Contact Settings Tab | 15 min | - | ⬜ Not started |
| SEO Settings Tab | 15 min | - | ⬜ Not started |
| Email Settings Tab | 15 min | - | ⬜ Not started |
| Payment Settings Tab | 10 min | - | ⬜ Not started |
| Shipping Settings Tab | 10 min | - | ⬜ Not started |
| Settings Helper Library | 20 min | - | ⬜ Not started |
| Apply Settings Across Site | 20 min | - | ⬜ Not started |
| Audit Trail | 15 min | - | ⬜ Not started |
| Polish & Test | 15 min | - | ⬜ Not started |
| **TOTAL** | **~2.5 hours** | - | - |

---

## 🔗 Dependencies

**Required Before Starting:**
- Phase 2: Admin UI Framework (requireAdmin middleware)
- Existing Prisma setup

**External Libraries:**
```json
{
  "nodemailer": "^6.9.0",        // For SMTP email sending
  "node-cache": "^5.1.2"         // For settings caching
}
```

**Environment Variables:**
```env
SETTINGS_ENCRYPTION_KEY=your-32-byte-hex-key-here
```

---

**Status:** Ready to implement anytime! ⚙️
