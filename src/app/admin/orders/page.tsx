import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils/conversions';
import { approveOrder, rejectOrder } from './actions';
import Decimal from 'decimal.js';

export default async function AdminOrders() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return null;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: { include: { product: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Approve or reject incoming orders.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Item (Requested)</TableHead>
              <TableHead>Qty (Base Storage)</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const item = order.items[0];
              const product = item.product;
              
              // Check if stock is sufficient
              const isStockSufficient = new Decimal(product.inventoryQuantity).gte(item.convertedQuantity);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{product.name} <br/><span className="text-xs text-muted-foreground">{item.orderedQuantity.toString()} {item.orderedUnit}</span></TableCell>
                  <TableCell>
                    {item.convertedQuantity.toString()} {product.baseUnit}
                    {!isStockSufficient && order.status === 'PENDING_APPROVAL' && (
                      <div className="text-xs text-destructive mt-1">Insufficient stock ({product.inventoryQuantity.toString()} left)</div>
                    )}
                  </TableCell>
                  <TableCell>{formatINR(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'PENDING_APPROVAL' ? 'secondary' : order.status === 'APPROVED' ? 'default' : 'destructive'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.status === 'PENDING_APPROVAL' && (
                      <div className="flex gap-2">
                        <form action={async () => {
                          'use server';
                          await approveOrder(order.id);
                        }}>
                          <Button size="sm" disabled={!isStockSufficient}>Approve</Button>
                        </form>
                        <form action={async () => {
                          'use server';
                          await rejectOrder(order.id);
                        }}>
                          <Button size="sm" variant="destructive">Reject</Button>
                        </form>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
