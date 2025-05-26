'use client'
import React, { useContext, createContext, ReactNode, useReducer } from 'react';

import { AuthState } from '@/interfaces/action-states/auth';
import authReducer from '@/reducers/auth';
import AuthAction from '@/types/actions/auth';

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>
} | null>(null);

const InitialState: AuthState = {
  data: null,
  loading: false,
  error: null,
};

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, InitialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be within an AuthContextProvider');
  }
  
  return context;
}