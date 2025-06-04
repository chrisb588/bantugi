import { AuthProvider } from '@/context/auth-context';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nohemi-font">
      <AuthProvider>
        {children}
      </AuthProvider>
    </div>
  );
}
