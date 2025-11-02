'use client';

import { SignUp } from "@clerk/nextjs";

// Prevent SSR to avoid hydration mismatch
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp />
    </div>
  );
}
