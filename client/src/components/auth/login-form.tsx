'use client';

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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
    
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
          <form className="w-full max-w-full">
            <div className="w-full grid gap-6 sm:gap-10">
              <div className="w-full grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" required />
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