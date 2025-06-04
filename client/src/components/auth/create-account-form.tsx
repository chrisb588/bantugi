'use client';

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";

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
import { useAuth } from "@/hooks/useAuth"; // Import useAuth
import { toast } from "sonner";

interface CreateAccountFormData extends UserAuthDetails {
  confirmPassword: string;
}

export function CreateAccountForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null); // Renamed to avoid conflict
  const { signup, isLoading, error: authError, user, initialAuthCheckComplete } = useAuth(); // Add user and initialAuthCheckComplete
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setFormError(null); // Clear form-specific error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // Extract username and password for the signup function
    const { username, password } = formData;
    const isSuccess = await signup({ username, password }); // Signup now returns a boolean, but we'll rely on the effect

    if (isSuccess) toast.success('Success! Check your email to confirm your signup.')
    
    // Navigation is handled by the useAuth hook upon successful signup
  };

  // Effect to handle redirection after user state changes
  useEffect(() => {
    // Only redirect if the initial auth check is complete and user is successfully authenticated
    if (initialAuthCheckComplete && user) {
      router.replace('/home');
    }
  }, [user, initialAuthCheckComplete, router]);
  
  const onLoginClick = () => {
    router.replace('/login')
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
                {/* Display form-specific error or auth error */}
                {(formError || authError) && (
                  <div className="w-full p-3 mb-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                    {formError || authError}
                  </div>
                )}
                <div className="grid gap-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading} // Disable input when loading
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading} // Disable input when loading
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                  </div>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading} // Disable input when loading
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-[70%] mx-auto" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>
          <Button variant="outline" className="w-full sm:w-[70%] mx-auto mt-2" onClick={onLoginClick} disabled={isLoading}>
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
