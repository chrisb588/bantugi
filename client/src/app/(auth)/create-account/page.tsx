"use client";

import Image from "next/image";
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { CreateAccountForm } from "@/components/auth/create-account-form"

export default function CreateAccountPage() {
  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out-cubic' });
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <CreateAccountForm />
      </div>
      <div className="absolute inset-0 bg-primary mix-blend-multiply -z-5"></div>
      <Image
        src="/img/landing-page-bg.jpeg"
        alt="Background Image"
        className="object-cover -z-10"
        fill
        quality={100}
        priority
      />
    </div>
  )
}
