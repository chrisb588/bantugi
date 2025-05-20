'use client';

import { AppSidebar } from '@/components/generic/app-sidebar';
import { Sidebar, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Map = dynamic(
  () => import('@/components/map/map'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-screen flex items-center justify-center bg-background">Loading map...</div>
  }
);

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Map</title>
        <meta name="description" content="Full screen map using Leaflet with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <main>
        <AppSidebar />
        <Map />
      </main>
    </>
  );
}