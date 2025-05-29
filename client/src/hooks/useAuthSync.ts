import { useEffect } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { useUserContext } from '@/context/user-context';

/**
 * Hook to synchronize auth and user contexts
 * This ensures user context stays in sync with authentication state
 */
export function useAuthSync() {
  const { state: authState } = useAuthContext();
  const { setUser, clearUser } = useUserContext();

  useEffect(() => {
    // Sync user context with auth context
    if (authState.user) {
      setUser(authState.user);
    } else if (authState.initialAuthCheckComplete) {
      // Only clear user if auth check is complete and no user found
      clearUser();
    }
  }, [authState.user, authState.initialAuthCheckComplete, setUser, clearUser]);
}
