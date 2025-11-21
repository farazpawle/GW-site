'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

/**
 * UserSyncer Component
 * 
 * Automatically synchronizes the authenticated Clerk user with the local database.
 * This ensures that a corresponding User record exists in Prisma even if webhooks fail.
 * 
 * Usage: Place this component in the root layout inside <ClerkProvider>.
 */
export function UserSyncer() {
  const { isSignedIn, user } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync if signed in, user data is loaded, and we haven't synced yet this session
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      
      fetch('/api/auth/sync')
        .then((res) => {
          if (!res.ok) {
            console.warn('⚠️ [UserSyncer] Sync failed:', res.statusText);
            // Reset sync flag on failure to retry next time? 
            // For now, we don't retry to avoid loops, but logging is good.
          } else {
            console.log('✅ [UserSyncer] User synchronized with database');
          }
        })
        .catch((err) => {
          console.error('❌ [UserSyncer] Error calling sync endpoint:', err);
        });
    }
  }, [isSignedIn, user]);

  return null;
}
