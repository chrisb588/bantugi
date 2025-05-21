"use client";

import { Navbar } from '@/components/ui/navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import { Footer } from '@/components/ui/footer';

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
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(to bottom, #B8180D 0%, #240502 100%)',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <Image 
          src="/img/hero-section-img2.png" 
          alt="Community scene"
          fill
          className="object-cover z-10 select-none pointer-events-none"
          quality={90}
          priority
        />
        <div 
          className="absolute inset-0 backdrop-blur-[2px] z-20"
          style={{ backgroundColor: 'rgba(138, 19, 8, 0.32)' }}
        ></div>
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-30">
          {/* HELP YOUR */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="100">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-3 sm:translate-y-2 lg:translate-y-3 z-0 text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-[#240502] text-center mb-2 tracking-tight whitespace-nowrap">
              HELP YOUR
            </span>
            <h1 className="relative z-10 text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white text-center mb-2 tracking-tight whitespace-nowrap saturate-150 select-none">
              HELP YOUR
            </h1>
          </div>
          {/* COMMUNITY */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="200">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-3 sm:translate-y-2 lg:translate-y-3 z-0 text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-[#240502] text-center mb-4 tracking-tight whitespace-nowrap">
              COMMUNITY
            </span>
            <h1 className="relative z-10 text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white text-center mb-4 tracking-tight whitespace-nowrap saturate-150 select-none">
              COMMUNITY
            </h1>
          </div>
          {/* TODAY! */}
          <div className="relative w-full flex justify-center" data-aos="fade-up" data-aos-delay="300">
            <span className="absolute select-none pointer-events-none left-1/2 top-0 -translate-x-1/2 translate-y-5 sm:translate-y-4 lg:translate-y-5 z-0 text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-[#240502] text-center mb-20 tracking-tight whitespace-nowrap">
              TODAY!
            </span>
            <h1 className="relative z-10 text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black text-white text-center mb-20 tracking-tight whitespace-nowrap saturate-150 select-none">
              TODAY!
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl mx-auto py-4" data-aos="fade-up" data-aos-delay="400">
            <Link href="/create-account" className="w-64 mx-auto">
              <Button
                className="w-64 px-6 py-4 text-lg lg:px-8 lg:py-5 lg:text-xl font-bold rounded-xl transition-all duration-200 hover:scale-105 bg-[#EA9F41] text-white hover:bg-white hover:text-[#EA9F41]"
              >
                Create Account
              </Button>
            </Link>
            
            <Link href="#mission" className="w-64 mx-auto">
              <Button
                className="w-64 px-6 py-4 text-lg lg:px-8 lg:py-5 lg:text-xl font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-90"
                style={{ backgroundColor: '#B8180D', color: '#FFFFFF' }}
              >
                Learn Our Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section id="mission" className="w-full h-screen flex flex-col">
        {/* Image Part with Title*/}
        <div className="relative w-full h-[60vh]">
          <Image 
            src="/img/hero-section-img-3.png" 
            alt="Community relief efforts"
            fill
            className="object-cover z-0 select-none pointer-events-none" // Image is base layer
            quality={85}
          />
          {/* Translucent Red Overlay*/}
          <div 
            className="absolute inset-0 backdrop-blur-[2px] z-10"
            style={{ backgroundColor: 'rgba(138, 19, 8, 0.32)' }}
          ></div>

          {/*"OUR MISSION"*/}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center z-20 pb-0 translate-y-1/4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="relative inline-block">
              <span className="absolute select-none pointer-events-none left-0 top-0 -translate-x-2 translate-y-1 lg:-translate-x-3 lg:translate-y-2 text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-[#B8180D] uppercase tracking-wider opacity-80"
              >
                OUR MISSION
              </span>
              <h2 className="relative text-5xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-wider"
              >
                OUR MISSION
              </h2>
            </div>
          </div>
        </div>

        {/* Text Content Part (e.g., 40% of screen height) */}
        <div 
          className="bg-[#B8180D] text-white p-6 sm:p-8 md:p-12 lg:p-16 text-center flex-grow flex flex-col pt-8 sm:pt-10 md:pt-12 lg:pt-14"
        >
          <p 
            className="text-lg sm:text-xl md:text-2xl lg:text-[1.6rem] max-w-3xl lg:max-w-4xl mx-auto leading-relaxed text-left"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            bantugi is a community-driven platform designed to amplify the voices of citizens and bring urgent local issues to the attention of the appropriate local government units (LGUs). By enabling users to report concerns such as infrastructure problems, safety hazards, environmental issues, or social welfare needs directly from their own personal devices,
          </p>
          <p 
            className="text-xl sm:text-2xl md:text-3xl lg:text-[2rem] max-w-3xl lg:max-w-4xl mx-auto leading-relaxed text-center mt-6"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            bantugi fosters greater civic engagement and accountability.
          </p>
        </div>
      </section>

      {/* Database Section with Hands and Text */}
      <section className="w-full flex flex-col items-center">
        <div className="relative w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh]">
          <Image 
            src="/img/hand-img-1.png" 
            alt="Hand reaching down"
            fill
            className="object-cover blur-[1px] select-none pointer-events-none"
            quality={80}
          />
        </div>
        <div 
          className="w-full text-white p-6 sm:p-8 md:p-12 lg:p-16 text-center"
          style={{ backgroundColor: '#EA9F41' }} 
        >
          <p 
            className="text-lg sm:text-xl md:text-3xl lg:text-[2rem] max-w-3xl lg:max-w-4xl mx-auto leading-relaxed"
            data-aos="fade-up"
          >
            This web application leverages a centralized and secure database to collect, store, and organize submitted reports in real-time. This database not only ensures that all information is efficiently archived and accessible to authorized officials, but also allows for smart categorization, prioritization, and tracking of reported issues.
          </p>
        </div>
        <div className="relative w-full h-[20vh] sm:h-[25vh] md:h-[30vh] lg:h-[35vh]">
          <Image 
            src="/img/hand-img-2.png" 
            alt="Hand reaching up"
            fill
            className="object-cover blur-[1px] select-none pointer-events-none"
            quality={80}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
