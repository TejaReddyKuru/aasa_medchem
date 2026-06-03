'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function OrdersChart({ data }: { data: { status: string; count: number }[] }) {
  // Format the status string for better readability
  const formattedData = data.map(d => ({
    ...d,
    status: d.status.replace('_', ' ')
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>Current snapshot of the fulfillment pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="status" 
                tickLine={false} 
                axisLine={false} 
                fontSize={12} 
                tickMargin={10} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                fontSize={12} 
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
