import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image";

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <LoginForm />
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
