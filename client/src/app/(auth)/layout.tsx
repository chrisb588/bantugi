import { AuthContextProvider } from '@/context/auth-context';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('[AuthLayout] Rendering AuthLayout...'); // ADDED THIS LOG
  return (
    <div className="nohemi-font">
      <AuthContextProvider>
        {children}
        <Toaster />
      </AuthContextProvider>
    </div>
  );
}
