'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/hooks/useAuth';
import UserAuthDetails from '@/interfaces/user-auth';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<UserAuthDetails>({
    email: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Debug log the raw form data
      console.log('Raw form data:', {
        email: formData.email,
        passwordLength: formData.password?.length || 0
      });

      // Basic validation
      if (!formData.email || !formData.password) {
        toast.error('Please fill in all fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmedEmail = formData.email.trim();
      if (!emailRegex.test(trimmedEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      // Clean the form data - IMPORTANT: Do not modify password
      const cleanedFormData = {
        email: trimmedEmail.toLowerCase(),
        password: formData.password // Keep password exactly as entered
      };

      // Debug log the cleaned data
      console.log('Cleaned form data:', {
        email: cleanedFormData.email,
        passwordLength: cleanedFormData.password.length
      });

      // Attempt login
      const success = await login(cleanedFormData);
      if (success) {
        console.log('Login successful');
      }
    } catch (err: any) {
      console.error('Login error details:', {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        statusText: err?.statusText
      });
      
      // Handle specific error cases
      if (err?.message?.toLowerCase().includes('invalid login credentials')) {
        toast.error('The email or password you entered is incorrect. Please try again.');
      } else if (err?.message?.toLowerCase().includes('email not confirmed')) {
        toast.error('Please verify your email address before logging in. Check your inbox for the confirmation link.');
      } else if (err?.message?.toLowerCase().includes('rate limit')) {
        toast.error('Too many login attempts. Please wait a moment before trying again.');
      } else {
        toast.error('Unable to log in. Please verify your credentials and try again.');
      }
    }
  };
  
  const onCreateAccountClick = () => {
    router.push('/auth/create-account');
  };

  const onForgotPasswordClick = () => {
    router.push('/auth/forgot-password');
  };
  
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card data-aos="fade-up" data-aos-delay="100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">READY TO SERVE <br /> YOUR COMMUNITY?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {error && (
            <div className="text-sm text-destructive text-center mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="w-full max-w-full">
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="px-0 font-normal"
                      type="button"
                      onClick={onForgotPasswordClick}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="px-0 font-normal"
                    type="button"
                    onClick={onCreateAccountClick}
                  >
                    Create one
                  </Button>
                </span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}