'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 pt-8 border-b border-white/10 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(36, 5, 2, 0.85)', paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}
    >
      <div className="text-3xl font-bold tracking-tight">
        <Link href="/" className="transition-all duration-200 hover:underline hover:underline-offset-4">
          <span style={{ color: '#B8180D' }}>ban</span>
          <span style={{ color: '#EA9F41' }}>tugi</span>
        </Link>
      </div>
      <div>
        <Link href="/login" passHref>
          <Button
            className="px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out hover:scale-105 bg-[#EA9F41] text-white hover:bg-white hover:text-[#EA9F41]"
          >
            Login
          </Button>
        </Link>
      </div>
    </nav>
  );
} 