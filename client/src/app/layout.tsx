import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const Satoshi = localFont({
  src: "../../public/fonts/Satoshi-Variable.ttf",
  variable: "--font-satoshi",
  display: "swap",
});

const Nohemi = localFont({
  src: [
    {
      path: "../../public/fonts/Nohemi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Nohemi-Bold.otf",
      weight: "700",
      style: "normal",
    }
  ],
  variable: "--font-nohemi",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Bantugi",
  description: "A platform for citizens to report and track local public issues",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${Satoshi.variable} ${Nohemi.variable} scroll-smooth`}>
      <body className="font-satoshi antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
