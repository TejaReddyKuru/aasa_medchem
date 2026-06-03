import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils/conversions';
import Link from 'next/link';
import { AdjustDialog } from './adjust-dialog';

export default async function AdminProducts() {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return null;

  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product & Inventory Management</h1>
          <p className="text-muted-foreground">Manage your marketplace catalog, pricing, and stock levels.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Available Stock</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-xs text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="font-semibold">{product.name}</TableCell>
                <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                <TableCell>{formatINR(product.pricePerBaseUnit)} / {product.baseUnit}</TableCell>
                <TableCell>
                  <span className={product.inventoryQuantity < product.minimumStockLevel ? 'text-destructive font-bold' : ''}>
                    {product.inventoryQuantity.toString()} {product.baseUnit}
                  </span>
                </TableCell>
                <TableCell>{product.minimumStockLevel.toString()} {product.baseUnit}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <AdjustDialog product={product} />
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit Info</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
