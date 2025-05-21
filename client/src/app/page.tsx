"use client";

import { Navbar } from '@/components/ui/navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out-cubic' });
  }, []);

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F3E9' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative w-full h-[100vh]">
        {/* Gradient background */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #B8180D 0%, #240502 100%)' }}></div>
        <Image 
          src="/img/hero-section-img2.png" 
          alt="Community scene"
          fill
          className="object-cover z-10"
          quality={90}
          priority
        />
        <div 
          className="absolute inset-0 backdrop-blur-none z-20"
          style={{ backgroundColor: 'rgba(138, 19, 8, 0.32)' }}
        ></div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-30">
          {/* HELP YOUR */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="100">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-3 z-0 text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black text-[#240502] text-center mb-2 tracking-tight whitespace-nowrap">
              HELP YOUR
            </span>
            <h1 className="relative z-10 text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black text-white text-center mb-2 tracking-tight whitespace-nowrap saturate-150">
              HELP YOUR
            </h1>
          </div>
          {/* COMMUNITY */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="200">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-3 z-0 text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black text-[#240502] text-center mb-4 tracking-tight whitespace-nowrap">
              COMMUNITY
            </span>
            <h1 className="relative z-10 text-7xl sm:text-8xl md:text-8xl lg:text-9xl font-black text-white text-center mb-4 tracking-tight whitespace-nowrap saturate-150">
              COMMUNITY
            </h1>
          </div>
          {/* TODAY! */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="300">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-5 z-0 text-9xl sm:text-[10rem] md:text-[9rem] lg:text-[11rem] font-black text-[#240502] text-center mb-20 tracking-tight whitespace-nowrap">
              TODAY!
            </span>
            <h1 className="relative z-10 text-9xl sm:text-[10rem] md:text-[9rem] lg:text-[11rem] font-black text-white text-center mb-20 tracking-tight whitespace-nowrap saturate-150">
              TODAY!
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl mx-auto py-4" data-aos="fade-up" data-aos-delay="400">
            <Link href="/create-account" className="w-64 mx-auto">
              <Button
                className="w-64 px-8 py-6 text-xl font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-110"
                style={{ backgroundColor: '#EA9F41', color: '#FFFFFF' }}
              >
                Create Account
              </Button>
            </Link>
            
            <Link href="#about" className="w-64 mx-auto">
              <Button
                className="w-64 px-8 py-6 text-xl font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:brightness-90"
                style={{ backgroundColor: '#B8180D', color: '#FFFFFF' }}
              >
                Learn Our Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section
        id="about"
        className="py-16 px-4 md:px-8 max-w-6xl mx-auto"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        {/* ... */}
      </section>
    </main>
  );
}
