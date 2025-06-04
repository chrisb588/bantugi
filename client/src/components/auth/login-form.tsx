'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const { login, isLoading, error, user, initialAuthCheckComplete } = useAuth();
  const [formData, setFormData] = useState<UserAuthDetails>({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  
  const validateForm = (): boolean => {
    const errors: {email?: string; password?: string} = {};
    let isValid = true;
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear validation error for this field when user types
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form before submitting
    const isValid = validateForm();
    if (!isValid) return;
    await login(formData);
  };

  // Effect to handle redirection after user state changes
  useEffect(() => {
    // Only redirect if the initial auth check is complete and user is successfully authenticated
    if (initialAuthCheckComplete && user) {
      router.replace('/home');
    }
  }, [user, initialAuthCheckComplete, router]);
  
  const onCreateAccountClick = () => {
    router.replace('/create-account')
  };
  
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card data-aos="fade-up" data-aos-delay="100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">READY TO SERVE <br /> YOUR COMMUNITY?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center w-full">
          {/* Combined error display */}
          {error && (
            <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <form className="w-full max-w-full" onSubmit={handleSubmit}>
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="your.email@example.com"
                  />
                  {/* Email validation error message */}
                  {validationErrors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </div>
                  )}
                  {/* Email validation error message */}
                  {validationErrors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {/* Password validation error message */}
                  {validationErrors.password && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.password}
                    </div>
                  )}
                  {/* Password validation error message */}
                  {validationErrors.password && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.password}
                    </div>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full sm:w-[70%] mx-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
          <Button 
            variant="outline" 
            className="w-full sm:w-[70%] mx-auto mt-2" 
            onClick={onCreateAccountClick}
            disabled={isLoading}
          >
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}