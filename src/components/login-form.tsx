
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormData = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const { signInWithEmail, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const error = await signInWithEmail(data.email, data.password);
      if (error) {
        toast({
          title: 'Sign In Failed',
          description: error,
          variant: 'destructive',
        });
      } else {
         toast({
          title: 'Success!',
          description: "You've been signed in.",
        });
      }
    });
  };

  const handlePasswordReset = () => {
    const email = form.getValues('email');
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to reset your password.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const error = await sendPasswordReset(email);
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Reset Email Sent',
          description: `If an account exists for ${email}, you will receive a password reset link.`,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                   <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-primary hover:underline focus:outline-none">
                        Forgot Password?
                    </button>
                  </div>
                  <FormControl>
                    <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
