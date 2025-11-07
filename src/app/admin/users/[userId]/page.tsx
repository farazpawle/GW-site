'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { User } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import UserProfile from '@/components/admin/users/UserProfile';

export default function UserDetailsPage({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.userId]);

  const fetchCurrentUser = async () => {
    try {
      // Use the new RBAC endpoint
      const response = await fetch('/api/admin/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      const data = await response.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users/${resolvedParams.userId}`);
      
      if (!response.ok) {
        setNotFound(true);
        return;
      }
      
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Users
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Users
          </Link>
        </div>
        <div
          className="rounded-xl border p-12 text-center"
          style={{
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400">
            The user you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Users
        </Link>
      </div>

      {/* User Profile with integrated RBAC controls */}
      {currentUser && (
        <UserProfile 
          user={user} 
          currentUser={currentUser}
          onChangeRole={() => {}} // Not used anymore - modals are inside UserProfile
          onUpdate={fetchUser} 
        />
      )}
    </div>
  );
}
