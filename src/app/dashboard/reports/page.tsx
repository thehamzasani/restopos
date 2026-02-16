'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SalesDashboard from '@/components/reports/SalesDashboard';

export default function ReportsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View sales reports and business insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/reports/sales')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Detailed Sales
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/reports/inventory')}
          >
            <Package className="h-4 w-4 mr-2" />
            Inventory Report
          </Button>
        </div>
      </div>

      {/* Existing Dashboard */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <SalesDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}