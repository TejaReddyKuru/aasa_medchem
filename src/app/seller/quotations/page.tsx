import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils/conversions';
import { PlaceOrderButton } from './place-order-button';

export default async function SellerQuotations() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const quotations = await prisma.quotation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Quotations</h1>
        <p className="text-muted-foreground">Review your quotations and place orders.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quo) => {
              const item = quo.items[0];
              return (
                <TableRow key={quo.id}>
                  <TableCell className="font-medium">{quo.quotationNumber}</TableCell>
                  <TableCell>{quo.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.requestedQuantity.toString()} {item.requestedUnit}</TableCell>
                  <TableCell>{formatINR(quo.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={quo.status === 'GENERATED' ? 'default' : 'secondary'}>
                      {quo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {quo.status === 'GENERATED' && (
                      <PlaceOrderButton quotationId={quo.id} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No quotations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
