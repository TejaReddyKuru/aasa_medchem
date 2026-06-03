import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils/conversions';
import { AdminOrderDialog } from './admin-order-dialog';

export default async function AdminOrders() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return null;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: { include: { product: true } } },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED': return 'secondary';
      case 'UNDER_REVIEW': return 'secondary';
      case 'PROCESSING': return 'default';
      case 'SHIPPED': return 'default';
      case 'DELIVERED': return 'default'; // Maybe use a custom green class
      case 'REJECTED': return 'destructive';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCustomColorClass = (status: string) => {
    if (status === 'PROCESSING') return 'bg-blue-600 hover:bg-blue-700';
    if (status === 'SHIPPED') return 'bg-purple-600 hover:bg-purple-700';
    if (status === 'DELIVERED') return 'bg-green-600 hover:bg-green-700';
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">Manage order lifecycles and approve processing.</p>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const item = order.items[0];
              const product = item.product;

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {item.convertedQuantity.toString()} {product.baseUnit}
                  </TableCell>
                  <TableCell className="font-bold">{formatINR(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status) as any} className={getCustomColorClass(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AdminOrderDialog 
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      initialStatus={order.status}
                      productName={product.name}
                      baseUnit={product.baseUnit}
                      inventoryQuantity={product.inventoryQuantity.toString()}
                      convertedQuantity={item.convertedQuantity.toString()}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
