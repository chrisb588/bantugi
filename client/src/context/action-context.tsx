// compiles action contexts

import React, { ReactNode } from 'react';

import { AuthContextProvider } from './auth-context';

const ActionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  );
}

export default ActionContextProvider;