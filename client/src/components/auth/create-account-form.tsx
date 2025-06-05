'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { isEmailRegistered, isValidEmailFormat } from "@/lib/email-validation";

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
  const [formError, setFormError] = useState<string | null>(null); // Renamed to avoid conflict
  const { signup, isLoading, error: authError, user, initialAuthCheckComplete } = useAuth(); // Add user and initialAuthCheckComplete
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  // State to track if we're checking email availability
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: {email?: string; password?: string; confirmPassword?: string} = {};
    let isValid = true;
    
    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmailFormat(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    } else if (emailAvailable === false) {
      // We know this email is already registered
      errors.email = "This email is already registered. Please use a different email.";
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
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  // Create a debounced function to check email availability
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      // Don't check if email is empty or invalid format
      if (!email || !isValidEmailFormat(email)) {
        setEmailAvailable(null);
        setIsCheckingEmail(false);
        return;
      }
      
      try {
        const isRegistered = await isEmailRegistered(email);
        setEmailAvailable(!isRegistered);
      } catch (error) {
        console.error('Error checking email availability:', error);
        // Don't set any status if there was an error checking
        setEmailAvailable(null);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500), // Wait 500ms after user stops typing
    []
  );
  
  // Enhanced input change handler with email availability check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setFormError(null);
    
    // Clear validation error for this field when user types
    if (validationErrors[id as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
    
    // If the email field changed, check availability
    if (id === 'email' && value) {
      setIsCheckingEmail(true);
      checkEmailAvailability(value);
    } else if (id === 'email') {
      // If email field is empty, reset availability status
      setEmailAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form before submission
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      // Extract username and password for the signup function
      const { email, password } = formData;
      const isSuccess = await signup({ email, password });

      if (isSuccess) {
        toast.success('Success! Check your email to confirm your signup.');
      }
      // Navigation is handled by the useAuth hook upon successful signup
    } catch (error: any) {
      // If there's an error that isn't already handled by the auth context
      // (though most should be), we can set it as a form error
      if (error.message && error.message.toLowerCase().includes('email already')) {
        setFormError('This email is already registered. Please use a different email or try logging in.');
      } else {
        setFormError(error.message || 'An error occurred during signup.');
      }
    }
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
        <CardContent className="flex flex-col items-center w-full">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                {/* Display form-specific error or auth error */}
                {(formError || authError) && (
                  <div className="w-full p-3 mb-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                    {formError || authError}
                  </div>
                )}
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading} // Disable input when loading
                      placeholder="your.email@example.com"
                      className={cn(
                        emailAvailable === true && "pr-10 border-green-500 focus-visible:ring-green-500",
                        emailAvailable === false && "pr-10 border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                      </div>
                    )}
                    {emailAvailable === true && !isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                    {emailAvailable === false && !isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {validationErrors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.email}
                    </div>
                  )}
                  {emailAvailable === false && !validationErrors.email && (
                    <div className="mt-1 text-sm text-red-600">
                      This email is already registered. Please use a different email or login.
                    </div>
                  )}
                  {emailAvailable === true && !validationErrors.email && (
                    <div className="mt-1 text-sm text-green-600">
                      Email is available for registration.
                    </div>
                  )}
                  {/* Email availability message */}
                  {isCheckingEmail && (
                    <div className="mt-1 text-sm text-gray-500">
                      Checking email availability...
                    </div>
                  )}
                  {emailAvailable === true && (
                    <div className="mt-1 text-sm text-green-600">
                      Email is available!
                    </div>
                  )}
                  {emailAvailable === false && (
                    <div className="mt-1 text-sm text-red-600">
                      Email is already registered.
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
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    disabled={isLoading} // Disable input when loading
                  />
                  {validationErrors.password && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.password}
                    </div>
                  )}
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
                  {validationErrors.confirmPassword && (
                    <div className="mt-1 text-sm text-red-600">
                      {validationErrors.confirmPassword}
                    </div>
                  )}
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
