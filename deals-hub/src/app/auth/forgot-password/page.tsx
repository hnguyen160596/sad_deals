'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { resetPassword } from '@/lib/api/supabase';

// Validation schema
const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <ShoppingBagIcon className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-gray-900">DealsHub</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSubmitted ? 'Check your email' : 'Reset your password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSubmitted
            ? 'We have sent you instructions to reset your password'
            : 'Enter your email address and we will send you a link to reset your password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSubmitted ? (
            <div className="space-y-6">
              <p className="text-center text-gray-700">
                Please check your email and follow the instructions to reset your password.
                If you don't see the email, check your spam folder.
              </p>
              <div className="flex flex-col space-y-3">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Return to login</Link>
                </Button>
                <Button variant="ghost" onClick={() => setIsSubmitted(false)}>
                  Try another email
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-primary hover:text-primary/90"
                  >
                    Return to login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
