"use client";

import { Navbar } from '@/components/ui/navbar';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from 'react';
import { Footer } from '@/components/ui/footer';
import { useState } from 'react';

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

        {/* Mission Description */}
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

      {/* Feature Section */}
      <section className="relative w-full py-16 md:py-24 lg:py-32 bg-[#240502] overflow-hidden px-0">
        <div className="w-full px-0">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12 lg:gap-20 relative">
            {/* Text Content */}
            <div className="flex-1 text-white px-4 sm:px-8 lg:px-16 z-10" data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                Pin your reports directly on the map!
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed">
                Bantugi helps you share and spot civic issues — from potholes to streetlights — so everyone can see them and take action.
              </p>
            </div>
            {/* Image */}
            <div className="flex-1 w-full flex items-end relative min-h-[350px] sm:min-h-[500px] md:min-h-[650px] lg:min-h-[800px]">
              <div className="absolute right-0 top-0 h-full w-full lg:w-[700px]">
                <Image
                  src="/img/landing-feature.png?v=1"
                  alt="Hand holding a phone showing the map feature"
                  fill
                  className="object-contain object-right"
                  quality={90}
                  priority
                />
              </div>
            </div>
          </div>
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

      {/* FAQ Section */}
      <section className="w-full bg-[#240502] text-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-black tracking-wider mb-10 text-center">Frequently Asked Questions</h2>
          <FAQAccordion />
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="w-full bg-[#240502] text-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 
            className="text-3xl sm:text-3xl md:text-3xl font-black tracking-wider mb-12 md:mb-16 lg:mb-20"
            data-aos="fade-up"
          >
            Contact Us
          </h2>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-10 lg:gap-x-12 gap-y-6 max-w-3xl mx-auto"
            data-aos="fade-up" data-aos-delay="200"
          >
            {[ // team members
              "Acabal, Harley Van",
              "Ayuda, Diana Rose",
              "Brillos, Christian",
              "Cadampog, Joanalyn",
              "Mijares, Jimmy Eleazar",
            ].map((name, index) => (
              <div 
                key={index} 
                className="py-4 border-b border-gray-700 transition-all duration-300 hover:border-gray-500"
              >
                <p className="text-l md:text-l font-normal text-gray-200 hover:text-white">{name}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 md:mt-16 lg:mt-20 text-lg md:text-xl text-gray-300" data-aos="fade-up" data-aos-delay="400">
            For inquiries, please reach out to any of our team members.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// FAQAccordion component
function FAQAccordion() {
  const faqs = [
    {
      question: "What is Bantugi?",
      answer: "Bantugi is a community-driven platform that allows users to report and view civic issues in their area, helping local governments and communities take action more efficiently."
    },
    {
      question: "How do I submit a report?",
      answer: "Simply create an account, log in, and use the 'Create Report' feature to pin your issue on the map, add details, and upload photos."
    },
    {
      question: "Who can see my reports?",
      answer: "All reports are visible to the public and local government units, ensuring transparency and encouraging community involvement."
    },
    {
      question: "Is Bantugi free to use?",
      answer: "Yes, Bantugi is completely free for all users. Our goal is to empower communities and improve civic engagement."
    }
  ];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden bg-[#2d0a07]">
          <button
            className="w-full text-left px-6 py-4 focus:outline-none flex justify-between items-center text-lg font-semibold hover:bg-[#38100b] transition-colors"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
            aria-controls={`faq-panel-${idx}`}
          >
            {faq.question}
            <span className={`ml-4 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {openIndex === idx && (
            <div id={`faq-panel-${idx}`} className="px-6 pb-4 text-base text-gray-200 transition-opacity duration-300 opacity-100">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
