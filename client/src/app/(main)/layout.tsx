"use client";

import Provider from "@/provider/provider";
import { MobileNavbar } from "@/components/generic/mobile-navbar";
import { MapProvider } from "@/context/map-context";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-satoshi">
      <Provider>
        <MapProvider>
          <MobileNavbar />
          <div className="fixed inset-0 pointer-events-none">
            {children}
          </div>
        </MapProvider>
      </Provider>
    </div>
  );
}
