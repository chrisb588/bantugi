import { AuthContextProvider } from '@/context/auth-context';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="nohemi-font">
      <AuthContextProvider>
      {children}
      </AuthContextProvider>
    </div>
  );
}
