import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Package } from 'lucide-react';

export default async function SellerDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) return null;

  const [
    totalQuotations,
    approvedOrders,
    productsAvailable,
  ] = await Promise.all([
    prisma.quotation.count({ where: { userId: session.user.id } }),
    prisma.order.count({ where: { userId: session.user.id, status: 'APPROVED' } }),
    prisma.product.count({ where: { isDeleted: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground">
          Browse products, generate quotations, and manage your orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Catalog</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsAvailable}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
