'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
  redirectIfAuthenticated?: boolean; // For login/signup pages to redirect away if already logged in
  authenticatedRedirectTo?: string; // Where to redirect if already authenticated
}

export function AuthGuard({ 
  children, 
  fallback = null, 
  redirectTo = '/login',
  loadingComponent = null,
  redirectIfAuthenticated = false,
  authenticatedRedirectTo = '/home'
}: AuthGuardProps) {
  const { user, isLoading, error, initialAuthCheckComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only proceed with redirect logic after initial auth check is complete
    if (initialAuthCheckComplete && !isLoading) {
      if (!user && !redirectIfAuthenticated) {
        // Regular auth guard - redirect to login if not authenticated
        router.push(redirectTo);
      } else if (user && redirectIfAuthenticated) {
        // Login/signup page behavior - redirect away if already authenticated
        router.push(authenticatedRedirectTo);
      }
    }
  }, [user, isLoading, initialAuthCheckComplete, router, redirectTo, redirectIfAuthenticated, authenticatedRedirectTo]);

  // Show custom loading component or default loading state
  if (!initialAuthCheckComplete || isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  // Handle authentication requirements based on redirectIfAuthenticated flag
  if (redirectIfAuthenticated) {
    // For login/signup pages: show children if NOT authenticated
    return user ? <>{fallback}</> : <>{children}</>;
  } else {
    // For protected pages: show children if authenticated
    return user ? <>{children}</> : <>{fallback}</>;
  }
}

export default AuthGuard;
