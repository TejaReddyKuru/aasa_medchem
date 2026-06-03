import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils/conversions';
import { QuotationDialog } from './quotation-dialog';

export default async function SellerCatalog() {
  const rawProducts = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { category: 'asc' },
  });

  const products = rawProducts.map(product => ({
    ...product,
    pricePerBaseUnit: product.pricePerBaseUnit.toString(),
    inventoryQuantity: product.inventoryQuantity.toString(),
    minimumStockLevel: product.minimumStockLevel.toString(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chemical Catalog</h1>
        <p className="text-muted-foreground">
          Browse products and create quotations for orders.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{product.description}</p>
              
              <div className="flex justify-between text-sm">
                <span className="font-medium">{formatINR(Number(product.pricePerBaseUnit))} / {product.baseUnit}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Stock:</span>
                <span className="font-medium">{product.inventoryQuantity.toString()} {product.baseUnit}</span>
              </div>

              <QuotationDialog product={product} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
