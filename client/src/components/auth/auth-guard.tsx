'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback = null, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, isLoading, initialAuthCheckComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only proceed with redirect logic after initial auth check is complete
    if (initialAuthCheckComplete && !isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, initialAuthCheckComplete, router, redirectTo]);

  // Show loading state while auth is being checked
  if (!initialAuthCheckComplete || isLoading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  // If user is not authenticated after initial check, show fallback or null
  if (!user) {
    return <>{fallback}</>;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default AuthGuard;
