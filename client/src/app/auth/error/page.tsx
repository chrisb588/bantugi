'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('message') || 'An error occurred during authentication'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Return to Login
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/auth/create-account')}
            className="w-full"
          >
            Create New Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
