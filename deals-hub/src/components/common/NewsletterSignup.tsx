'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

type NewsletterSignupProps = {
  title?: string;
  description?: string;
  bgColor?: 'white' | 'gray' | 'dark';
};

export default function NewsletterSignup({
  title = "Subscribe to our newsletter",
  description = "Get the latest deals and coupons sent straight to your inbox",
  bgColor = 'gray',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send this to your API
      // await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // For demonstration, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Thanks for subscribing to our newsletter!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine background and text colors based on bgColor prop
  let containerClasses = '';
  let titleClasses = '';
  let descriptionClasses = '';

  switch (bgColor) {
    case 'white':
      containerClasses = 'bg-white';
      titleClasses = 'text-gray-900';
      descriptionClasses = 'text-gray-600';
      break;
    case 'dark':
      containerClasses = 'bg-gray-900';
      titleClasses = 'text-white';
      descriptionClasses = 'text-gray-300';
      break;
    case 'gray':
    default:
      containerClasses = 'bg-gray-100';
      titleClasses = 'text-gray-900';
      descriptionClasses = 'text-gray-600';
      break;
  }

  return (
    <section className={`py-12 ${containerClasses}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <EnvelopeIcon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className={`text-3xl font-bold ${titleClasses}`}>{title}</h2>
          <p className={`mt-4 text-lg ${descriptionClasses}`}>{description}</p>

          <form onSubmit={handleSubmit} className="mt-8 sm:flex justify-center">
            <div className="min-w-0 flex-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-3 text-base text-gray-900 placeholder-gray-500 focus:ring-primary focus:border-primary rounded-md"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Button
                type="submit"
                className="w-full flex items-center justify-center px-5 py-3 text-base font-medium rounded-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </form>

          <p className={`mt-3 text-sm ${descriptionClasses}`}>
            We care about your data. Read our{' '}
            <Link href="/privacy-policy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

// Link component for TypeScript compatibility
function Link({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
