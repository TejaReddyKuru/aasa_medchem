import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/utils/conversions';
import Link from 'next/link';

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
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">Manage your marketplace catalog and pricing.</p>
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
              <TableHead>Dimension</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-xs text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="font-semibold">{product.name}</TableCell>
                <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                <TableCell>{product.dimensionType} ({product.baseUnit})</TableCell>
                <TableCell>{formatINR(product.pricePerBaseUnit)}</TableCell>
                <TableCell>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">Edit / Update Price</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
