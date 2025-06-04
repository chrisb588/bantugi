// compiles action contexts

import React, { ReactNode } from 'react';

import { AuthProvider } from '@/context/auth-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MapProvider } from '@/context/map-context';
import { UserContextProvider } from '@/context/user-context';

const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <MapProvider>
        <AuthProvider>
          <UserContextProvider>
            {children}
          </UserContextProvider>
        </AuthProvider>
      </MapProvider>
    </SidebarProvider>
  );
}

export default Provider;