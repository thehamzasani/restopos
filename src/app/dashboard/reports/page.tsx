'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesDashboard from '@/components/reports/SalesDashboard';
import { Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View sales reports and business insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales" className="space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Sales Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="space-x-2">
            <Package className="h-4 w-4" />
            <span>Inventory Report</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesDashboard />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Inventory reporting coming in Day 13
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}