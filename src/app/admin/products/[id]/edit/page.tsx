import { prisma } from '@/lib/prisma';
import { ProductForm } from '../../product-form';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  return (
    <div className="space-y-6">
      <ProductForm product={product} />
    </div>
  );
}
