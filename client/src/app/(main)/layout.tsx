'use client';

import dynamic from "next/dynamic";

import DesktopSidebar from "@/components/generic/desktop-sidebar";
import Provider from "@/provider/provider";
import { MobileNavbar } from "@/components/generic/mobile-navbar";

const Map = dynamic(
  () => import('@/components/map/map'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center bg-background">Loading map...</div>
  }
);

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-satoshi">
      <Provider>
        <DesktopSidebar />
        <MobileNavbar />
        <Map />
        <div className="fixed inset-0 pointer-events-none">
          {children}
        </div>
      </Provider>
    </div>
  );
}
