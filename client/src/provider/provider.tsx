// compiles action contexts

import React, { ReactNode } from 'react';

import { AuthContextProvider } from '@/context/auth-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MapProvider } from '@/context/map-context';

const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <MapProvider>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </MapProvider>
    </SidebarProvider>
  );
}

export default Provider;