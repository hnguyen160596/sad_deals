'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  TagIcon,
  UsersIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  // Demo data for dashboard stats
  const stats = [
    { name: 'Total Deals', value: '487', change: '+12%', trend: 'up', icon: TagIcon },
    { name: 'Active Stores', value: '162', change: '+3%', trend: 'up', icon: BuildingStorefrontIcon },
    { name: 'Total Users', value: '24,521', change: '+5%', trend: 'up', icon: UsersIcon },
    { name: 'Page Views', value: '89,623', change: '+18%', trend: 'up', icon: EyeIcon },
  ];

  // Demo data for top deals
  const topDeals = [
    { id: '1', title: 'Sony WH-1000XM4 Headphones', views: 1824, clicks: 542, store: 'Amazon' },
    { id: '2', title: 'KitchenAid Artisan Mixer', views: 1521, clicks: 421, store: 'Best Buy' },
    { id: '3', title: 'Apple AirPods Pro', views: 1328, clicks: 387, store: 'Walmart' },
    { id: '4', title: 'Dyson V11 Vacuum', views: 1147, clicks: 309, store: 'Target' },
    { id: '5', title: 'Samsung 65" QLED TV', views: 986, clicks: 276, store: 'Costco' },
  ];

  // Demo data for top stores
  const topStores = [
    { id: '1', name: 'Amazon', deals: 72, clicks: 2438 },
    { id: '2', name: 'Walmart', deals: 58, clicks: 1875 },
    { id: '3', name: 'Target', deals: 43, clicks: 1542 },
    { id: '4', name: 'Best Buy', deals: 39, clicks: 1328 },
    { id: '5', name: 'Home Depot', deals: 28, clicks: 984 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>Add New Deal</Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.name}</CardTitle>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activity card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <TagIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New deal added</p>
                <p className="text-xs text-gray-500">Amazon - Fire TV Stick 4K for $29.99</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-2 rounded-full">
                <BuildingStorefrontIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Store updated</p>
                <p className="text-xs text-gray-500">Best Buy - Updated logo and website URL</p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-2 rounded-full">
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <TagIcon className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Deal expired</p>
                <p className="text-xs text-gray-500">Target - 20% Off Kitchen Appliances</p>
                <p className="text-xs text-gray-400">1 day ago</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/activity">View All Activity</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Top deals table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Deals</CardTitle>
            <CardDescription>Deals with the highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium py-2">Deal</th>
                    <th className="text-right font-medium py-2">Views</th>
                    <th className="text-right font-medium py-2">Clicks</th>
                    <th className="text-right font-medium py-2">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {topDeals.map((deal) => (
                    <tr key={deal.id} className="border-b">
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-xs text-gray-500">{deal.store}</div>
                        </div>
                      </td>
                      <td className="text-right py-3">{deal.views.toLocaleString()}</td>
                      <td className="text-right py-3">{deal.clicks.toLocaleString()}</td>
                      <td className="text-right py-3">
                        <div className="flex items-center justify-end">
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          {((deal.clicks / deal.views) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/deals">View All Deals</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Additional stats section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top stores */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Stores</CardTitle>
            <CardDescription>Stores with the most engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStores.map((store) => (
                <div key={store.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 text-lg font-bold text-gray-500">{store.id}</div>
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-xs text-gray-500">{store.deals} active deals</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{store.clicks} clicks</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/stores">View All Stores</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your site efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/deals/new">
                  <TagIcon className="h-8 w-8" />
                  <span>Add New Deal</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/stores/new">
                  <BuildingStorefrontIcon className="h-8 w-8" />
                  <span>Add New Store</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/categories/new">
                  <ShoppingBagIcon className="h-8 w-8" />
                  <span>Add Category</span>
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                <Link href="/admin/settings/seo">
                  <ArrowTrendingUpIcon className="h-8 w-8" />
                  <span>SEO Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
