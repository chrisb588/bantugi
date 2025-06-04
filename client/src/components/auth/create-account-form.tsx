'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userSignUp } from "@/lib/supabase/user.client";
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
import UserAuthDetails from "@/interfaces/user-auth";
import { toast } from "react-hot-toast";

interface CreateAccountFormData extends UserAuthDetails {
  confirmPassword: string;
}

export function CreateAccountForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Attempt to sign up
      const result = await userSignUp({
        email: formData.email,
        password: formData.password
      });

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.');
        router.push('/auth/verify-email');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onLoginClick = () => {
    router.replace('/auth/login');
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card data-aos="fade-up" data-aos-delay="100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">START SERVING YOUR <br /> COMMUNITY TODAY!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <form onSubmit={handleSubmit} className="w-full max-w-full">
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Enter your password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required 
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                  </div>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-[70%] mx-auto" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
          <Button 
            variant="outline" 
            className="w-full sm:w-[70%] mx-auto mt-2" 
            onClick={onLoginClick}
            disabled={isLoading}
          >
            Already have an account? Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
