'use client'

import { useAuthContext } from '@/context/auth-context';

export function useAuth() {
  const context = useAuthContext();
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { state, login, signup, signOut, resetPassword } = context;

  return {
    user: state.data,
    isLoading: state.loading,
    error: state.error,
    login,
    signup,
    signOut,
    resetPassword
  };
}