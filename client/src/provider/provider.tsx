// compiles action contexts

import React, { ReactNode } from 'react';

import { AuthContextProvider } from '@/context/auth-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MapProvider } from '@/context/map-context';
import { UserContextProvider } from '@/context/user-context';
import { useAuthSync } from '@/hooks/useAuthSync';

// Component to handle auth synchronization
function AuthSyncWrapper({ children }: { children: ReactNode }) {
  useAuthSync(); // Sync auth and user contexts
  return <>{children}</>;
}

const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <MapProvider>
        <AuthContextProvider>
          <UserContextProvider>
            <AuthSyncWrapper>
              {children}
            </AuthSyncWrapper>
          </UserContextProvider>
        </AuthContextProvider>
      </MapProvider>
    </SidebarProvider>
  );
}

export default Provider;