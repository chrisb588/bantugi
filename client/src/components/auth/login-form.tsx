'use client';

import { useState } from 'react';
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
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<UserAuthDetails>({
    username: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };
  
  const onCreateAccountClick = () => {
    router.replace('/create-account')
  };
  
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card data-aos="fade-up" data-aos-delay="100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">READY TO SERVE <br /> YOUR COMMUNITY?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {error && (
            <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          <form className="w-full max-w-full" onSubmit={handleSubmit}>
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
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