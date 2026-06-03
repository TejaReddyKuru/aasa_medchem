import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AdjustDialog } from './adjust-dialog';
import Decimal from 'decimal.js';

export default async function AdminInventory() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return null;

  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Monitor stock levels and manually adjust quantities.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Base Unit</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isLowStock = new Decimal(product.inventoryQuantity).lte(product.minimumStockLevel);
              const isOutOfStock = new Decimal(product.inventoryQuantity).lte(0);
              
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell>{product.baseUnit}</TableCell>
                  <TableCell className="font-bold">{product.inventoryQuantity.toString()}</TableCell>
                  <TableCell>
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge variant="secondary" className="text-orange-600 bg-orange-100 border-orange-200">Low Stock</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <AdjustDialog product={product} />
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
