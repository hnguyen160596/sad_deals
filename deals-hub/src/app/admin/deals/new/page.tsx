'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ChevronLeftIcon, PlusIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createDeal, fetchAllStores, fetchAllCategories, Store, Category } from '@/lib/api/supabase';
import { useToast } from '@/components/ui/use-toast';

// Form validation schema matching the database model
const dealFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  store_id: z.string().min(1, 'Store is required'),
  category_id: z.string().min(1, 'Category is required'),
  price: z.string().min(1, 'Price is required'),
  original_price: z.string().min(1, 'Original price is required'),
  url: z.string().url('Must be a valid URL').min(1, 'Deal URL is required'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(false),
  slug: z.string().min(1, 'Slug is required'),
  expires_at: z.date().optional(),
  deal_terms: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  keywords: z.string().optional(),
  hide_expiration: z.boolean().default(false),
  notify_users: z.boolean().default(false),
  affiliate_code: z.string().optional(),
  coupon_code: z.string().optional(),
  status: z.enum(['draft', 'active', 'scheduled']),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function NewDealPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch stores and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storesResult, categoriesResult] = await Promise.all([
          fetchAllStores({ active: true }),
          fetchAllCategories({ active: true }),
        ]);
        setStores(storesResult.data || []);
        setCategories(categoriesResult.data || []);
      } catch (error) {
        console.error('Error loading form data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load stores and categories. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Initialize form with default values
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: '',
      description: '',
      store_id: '',
      category_id: '',
      price: '',
      original_price: '',
      url: '',
      image_url: '',
      is_featured: false,
      is_active: false,
      status: 'draft',
      slug: '',
      deal_terms: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      hide_expiration: false,
      notify_users: true,
      affiliate_code: '',
      coupon_code: '',
    },
  });

  const watchStatus = form.watch('status');

  // Handle form submission
  const onSubmit = async (values: DealFormValues) => {
    setIsSubmitting(true);
    try {
      // Transform status to is_active
      const is_active = values.status === 'active';

      // Format the expires_at date if it exists
      const dealData = {
        ...values,
        is_active,
        expires_at: values.expires_at ? values.expires_at.toISOString() : undefined,
      };

      // Remove the status field as it's not in our DB schema
      const { status, ...dataToSubmit } = dealData;

      // Save the deal to the database
      await createDeal(dataToSubmit);

      toast({
        title: 'Success',
        description: 'Deal created successfully!',
      });

      router.push('/admin/deals');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues('title');
    if (!title) return;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    form.setValue('slug', slug, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" asChild>
            <Link href="/admin/deals">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back to Deals
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Add New Deal</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Information</CardTitle>
                  <CardDescription>
                    Enter the basic information about the deal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sony WH-1000XM4 Wireless Headphones 30% Off" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear, concise title that describes the deal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the deal, product features, and any important details..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Store select from database */}
                    <FormField
                      control={form.control}
                      name="store_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a store" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading stores...
                                </SelectItem>
                              ) : stores.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No stores found
                                </SelectItem>
                              ) : (
                                stores.map(store => (
                                  <SelectItem key={store.id} value={store.id}>
                                    {store.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category select from database */}
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading categories...
                                </SelectItem>
                              ) : categories.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No categories found
                                </SelectItem>
                              ) : (
                                categories.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deal Price</FormLabel>
                          <FormControl>
                            <Input placeholder="$99.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price</FormLabel>
                          <FormControl>
                            <Input placeholder="$129.99" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/deal" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to the store where users can purchase the deal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          URL to the product image. Leave blank to use the default image.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coupon_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="SAVE20" {...field} />
                        </FormControl>
                        <FormDescription>
                          If this deal requires a coupon code, enter it here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deal_terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deal Terms (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific terms and conditions for this deal..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>
                    Optimize your deal for search engines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input placeholder="deal-name-goes-here" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateSlug}
                            disabled={!form.getValues('title')}
                          >
                            <ArrowUpIcon className="h-4 w-4 mr-1" />
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          The unique URL path for this deal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Custom SEO title" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use the deal title.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Custom SEO description..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use the deal description.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="deals, discount, product name, etc." {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords for better SEO.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the current status of this deal.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(watchStatus === 'active' || watchStatus === 'scheduled') && (
                    <FormField
                      control={form.control}
                      name="expires_at"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiration Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When this deal will expire.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="hide_expiration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Hide expiration date
                          </FormLabel>
                          <FormDescription>
                            Don't show expiration date to users
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deal Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Featured Deal
                          </FormLabel>
                          <FormDescription>
                            Highlight this deal on the homepage and deal listings.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notify_users"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Notify Users
                          </FormLabel>
                          <FormDescription>
                            Send notifications about this deal to subscribed users.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="affiliate_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Affiliate Code (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormDescription>
                          Affiliate tracking code to include in deal URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/deals">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Deal'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
