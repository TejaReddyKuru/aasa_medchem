'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { convertToBaseUnit } from '@/lib/utils/conversions';
import { DimensionType } from '@prisma/client';
import Decimal from 'decimal.js';

export async function createQuotation(data: {
  productId: string;
  quantity: string;
  unit: string;
  dimension: DimensionType;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw new Error('Product not found');

  const qtyInBase = convertToBaseUnit(data.quantity, data.unit, data.dimension);
  
  if (qtyInBase.greaterThan(product.inventoryQuantity)) {
    throw new Error('Requested quantity exceeds available inventory');
  }

  const basePrice = product.pricePerBaseUnit;
  const subtotal = qtyInBase.mul(basePrice);

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: `QUO-${Date.now()}`,
      userId: session.user.id,
      totalAmount: subtotal,
      status: 'GENERATED',
      items: {
        create: {
          productId: product.id,
          requestedQuantity: new Decimal(data.quantity),
          requestedUnit: data.unit,
          convertedQuantity: qtyInBase,
          unitPrice: basePrice,
          subtotal: subtotal,
        }
      }
    }
  });

  return { success: true, quotationId: quotation.id };
}
