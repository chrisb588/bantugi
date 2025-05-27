'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { userReducer, initialState } from '@/reducers/user';
import type User from '@/interfaces/user';

interface UserContextType {
  state: typeof initialState;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const clearUser = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  return (
    <UserContext.Provider value={{ state, setUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}