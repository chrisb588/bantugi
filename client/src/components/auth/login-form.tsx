'use client';

import { useState } from "react";
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
import UserAuthDetails from "@/interfaces/user-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [formData, setFormData] = useState<UserAuthDetails>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
    
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

    try {
      // TODO: api call for login (backend)
      console.log('Login attempt with:', formData);
      
      // On successful login:
      router.replace('/home');
    } catch (err) {
      setError('Invalid username or password');
    }
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
           <form onSubmit={handleSubmit} className="w-full max-w-full">
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
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
                  />
                </div>
              </div>
              <Button type="submit" className="w-full sm:w-[70%] mx-auto">
                Login
              </Button>
            </div>
          </form>
          <Button variant="outline" className="w-full sm:w-[70%] mx-auto mt-2" onClick={onCreateAccountClick}>
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}