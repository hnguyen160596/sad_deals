'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <ShoppingBagIcon className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-gray-900">DealsHub</span>
          </Link>
        </div>
        <div className="mt-6 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-md text-gray-600 max-w-md mx-auto">
            We've sent a verification link to your email address. Please check your inbox and click on the link to verify your account.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    If you don't see the email in your inbox, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  Return to login
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">
                  Go to homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
