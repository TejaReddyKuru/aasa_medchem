import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, IndianRupee, FileText, AlertTriangle } from 'lucide-react';
import { formatINR } from '@/lib/utils/conversions';
import Decimal from 'decimal.js';
import { OrdersChart } from './orders-chart';
import { InventoryChart } from './inventory-chart';

export default async function AdminDashboard() {
  const [
    productsCount,
    lowStockCount,
    pendingOrders,
    products,
    orderStats,
    inventoryStats,
  ] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.count({ 
      where: { 
        isDeleted: false,
        inventoryQuantity: { lte: prisma.product.fields.minimumStockLevel }
      } 
    }),
    prisma.order.count({ where: { status: 'ORDER_PLACED' } }),
    prisma.product.findMany({ where: { isDeleted: false } }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { isDeleted: false }
    }),
  ]);

  // Format data for charts
  const ordersChartData = orderStats.map(stat => ({
    status: stat.status,
    count: stat._count.status
  }));

  const inventoryChartData = inventoryStats.map(stat => ({
    category: stat.category,
    count: stat._count.category
  }));

  // Calculate total inventory value
  const totalValue = products.reduce((acc, p) => {
    return acc.add(new Decimal(p.inventoryQuantity).mul(new Decimal(p.pricePerBaseUnit)));
  }, new Decimal(0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your marketplace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        <OrdersChart data={ordersChartData} />
        <InventoryChart data={inventoryChartData} />
      </div>
    </div>
  );
}
