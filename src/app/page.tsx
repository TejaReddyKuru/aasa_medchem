import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { HomeClient } from './home-client';

export default async function HomePage() {
  const session = await auth();
  
  // Fetch only non-deleted products
  const rawProducts = await prisma.product.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize Decimal objects for Client Boundary
  const serializedProducts = rawProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    pricePerBaseUnit: p.pricePerBaseUnit.toString(),
    baseUnit: p.baseUnit,
  }));

  return <HomeClient session={session} products={serializedProducts} />;
}
