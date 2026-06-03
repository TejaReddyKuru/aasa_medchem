'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function convertToOrder(quotationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId, userId: session.user.id },
    include: { items: true },
  });

  if (!quotation) throw new Error('Quotation not found');
  if (quotation.status !== 'GENERATED') throw new Error('Invalid quotation status');

  // Create the Order in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Mark quotation as converted
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'CONVERTED_TO_ORDER' },
    });

    // 2. Create the Order
    const order = await tx.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: session.user.id,
        quotationId: quotation.id,
        status: 'PENDING_APPROVAL',
        totalAmount: quotation.totalAmount,
        items: {
          create: quotation.items.map((item) => ({
            productId: item.productId,
            orderedQuantity: item.requestedQuantity,
            orderedUnit: item.requestedUnit,
            convertedQuantity: item.convertedQuantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
    });

    // 3. Create Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'Quotation Converted to Order',
        entityType: 'Order',
        entityId: order.id,
      },
    });
  });

  revalidatePath('/seller/quotations');
  revalidatePath('/seller/orders');
}
