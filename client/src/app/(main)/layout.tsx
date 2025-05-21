'use client';

import dynamic from "next/dynamic";

import DesktopSidebar from "@/components/generic/desktop-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      <SidebarProvider>
        <DesktopSidebar />
        <MobileNavbar />
        <Map />
        {children}
      </SidebarProvider>
    </div>
  );
}
