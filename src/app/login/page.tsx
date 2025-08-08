
"use client";

import { Feather } from 'lucide-react';
import { AuthButton } from '@/components/auth-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (user) {
    redirect('/');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Feather className="w-20 h-20 text-primary" />
          <h1 className="text-5xl font-headline font-bold text-primary">FeatherFind</h1>
          <p className="text-xl text-center text-muted-foreground">
            Your personal birdwatching companion.
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <LoginForm />
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6">
              <AuthButton />
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
