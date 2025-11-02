'use client';

import { SignIn } from "@clerk/nextjs";

// Prevent SSR to avoid hydration mismatch
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  );
}
