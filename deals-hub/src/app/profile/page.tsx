'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { updateUserProfile } from '@/lib/api/supabase';

// Profile update schema
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  // Update form values when user data is available
  React.useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;

    setIsUpdating(true);
    try {
      await updateUserProfile(user.id, {
        username: data.username,
        avatar_url: data.avatar_url,
      });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'An error occurred updating your profile');
    } finally {
      setIsUpdating(false);
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-10 w-48" />
          <div className="w-full max-w-2xl">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Profile</h1>

      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user.avatar_url || ''} alt={user.username || 'User'} />
          <AvatarFallback className="text-2xl">{getInitials(user.username)}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.username || 'User'}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information here. Your email cannot be changed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="profile-form" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/avatar.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="profile-form"
                disabled={isUpdating || !form.formState.isDirty}
              >
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Manage your email notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Coming soon</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Email preferences will be available in a future update.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
