import { AuthContextProvider } from '@/context/auth-context';

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
      </AuthContextProvider>
    </div>
  );
}
