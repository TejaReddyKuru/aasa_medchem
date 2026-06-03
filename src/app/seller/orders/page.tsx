import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils/conversions';

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-muted-foreground">Track the status of your submitted orders.</p>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product(s)</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const mainItem = order.items[0];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {mainItem?.product.name}
                    <div className="text-xs text-muted-foreground mt-1">
                      Qty: {mainItem?.orderedQuantity.toString()} {mainItem?.orderedUnit}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{formatINR(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === 'APPROVED' ? 'default' :
                        order.status === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }
                      className={order.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  You have not placed any orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
