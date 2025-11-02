# Clerk Authentication Integration

This document outlines the Clerk authentication integration implemented in the Garrit & Wulf Next.js application using the **App Router** approach.

## Overview

Clerk provides a complete authentication solution for Next.js applications with built-in components for sign-in, sign-up, and user management. This integration follows the latest Clerk App Router guidelines.

## Installation

The Clerk Next.js SDK has been installed:

```bash
npm install @clerk/nextjs
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.local.example`):

```bash
# Get these from: https://dashboard.clerk.com/last-active?path=api-keys

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Important:**
- Get your keys from the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
- The `.env.local` file is gitignored and should never be committed
- The publishable key is safe for client-side use
- The secret key should remain confidential and is only used server-side

### 2. Middleware Setup

The `src/middleware.ts` file uses `clerkMiddleware()` to protect routes:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

This configuration:
- Runs Clerk middleware on all routes except static files
- Always runs for API routes
- Enables authentication across the entire application

### 3. Root Layout

The `src/app/layout.tsx` file wraps the application with `<ClerkProvider>`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 4. Header Component

The `src/components/Header.tsx` includes Clerk authentication UI:

- **Sign In Button** - Opens a modal for existing users
- **Sign Up Button** - Opens a modal for new users
- **User Button** - Shows user profile and settings when signed in

The implementation uses Clerk's built-in components:
- `<SignedOut>` - Renders content only for unauthenticated users
- `<SignedIn>` - Renders content only for authenticated users
- `<SignInButton>` - Pre-built sign-in button with modal
- `<SignUpButton>` - Pre-built sign-up button with modal
- `<UserButton>` - User profile dropdown with account management

## Features

### Authentication States

The application automatically handles two states:

**Signed Out:**
- Displays "Sign In" and "Sign Up" buttons in the header
- Users can click either button to authenticate

**Signed In:**
- Displays the UserButton with the user's avatar
- Clicking the UserButton shows:
  - User profile
  - Account settings
  - Sign out option

### Protected Routes

To protect specific routes, update `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

### Server-Side User Data

To access user data in Server Components:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello {user?.firstName}</div>;
}
```

### Client-Side User Data

To access user data in Client Components:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';

export default function Profile() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;
  
  return <div>Hello {user.firstName}</div>;
}
```

## Customization

### Appearance

Clerk components can be customized with the `appearance` prop:

```typescript
<UserButton 
  appearance={{
    elements: {
      avatarBox: "w-9 h-9",
      userButtonPopoverCard: "shadow-xl"
    }
  }}
/>
```

### Modal vs. Redirect Mode

Authentication buttons support two modes:

```typescript
// Modal (default) - Opens in a modal dialog
<SignInButton mode="modal">...</SignInButton>

// Redirect - Navigates to a dedicated page
<SignInButton mode="redirect" redirectUrl="/sign-in">...</SignInButton>
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign Up" in the header to create a test account

4. Verify:
   - User can sign up successfully
   - UserButton appears after sign-in
   - User can access their profile
   - User can sign out

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use different keys for development and production
   - Rotate keys if they're exposed

2. **Protected Routes:**
   - Always protect sensitive routes in middleware
   - Verify authentication on the server-side
   - Don't rely solely on client-side checks

3. **User Data:**
   - Validate user permissions for sensitive operations
   - Use server-side authentication for API routes
   - Sanitize user inputs

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Component Reference](https://clerk.com/docs/components/overview)
- [Authentication Patterns](https://clerk.com/docs/authentication/overview)

## Troubleshooting

### "Clerk: Missing publishableKey" Error
- Ensure `.env.local` exists with valid keys
- Restart the development server after adding environment variables

### Authentication Not Working
- Verify middleware.ts is in the correct location (`src/` or root)
- Check that ClerkProvider wraps your entire application
- Ensure environment variables are correctly named

### Styles Not Matching
- Customize Clerk components using the `appearance` prop
- Match your application's design system
- Use Tailwind classes for consistent styling

## Migration Notes

This integration uses the **latest Clerk App Router approach**:
- ✅ Uses `clerkMiddleware()` from `@clerk/nextjs/server`
- ✅ Uses App Router (`app/` directory)
- ✅ Uses `<ClerkProvider>` in root layout
- ❌ Does NOT use deprecated `authMiddleware()`
- ❌ Does NOT use Pages Router (`pages/` directory)
