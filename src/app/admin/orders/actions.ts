'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import Decimal from 'decimal.js';
import { sendOrderApprovalEmail } from '@/lib/utils/email';
import { formatINR } from '@/lib/utils/conversions';

export async function approveOrder(orderId: string) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'PENDING_APPROVAL') throw new Error('Invalid order status');

  await prisma.$transaction(async (tx) => {
    // 1. Verify stock and decrement for each item
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);

      if (new Decimal(product.inventoryQuantity).lt(item.convertedQuantity)) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      await tx.product.update({
        where: { id: product.id },
        data: {
          inventoryQuantity: { decrement: item.convertedQuantity },
        },
      });

      // 2. Create Inventory Transaction Log
      await tx.inventoryTransaction.create({
        data: {
          productId: product.id,
          quantity: item.convertedQuantity,
          transactionType: 'ORDER_FULFILLMENT',
          remarks: `Fulfilled for Order ${order.orderNumber}`,
        }
      });
    }

    // 3. Mark order as APPROVED
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'APPROVED' },
    });

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'Order Approved',
        entityType: 'Order',
        entityId: order.id,
      },
    });
  });

  // 5. Send asynchronous email notification (don't await/block on it)
  sendOrderApprovalEmail(
    order.user.email,
    order.user.name || 'Seller',
    order.orderNumber,
    formatINR(order.totalAmount)
  ).catch(e => console.error("Non-fatal email error:", e));

  revalidatePath('/admin/orders');
  revalidatePath('/admin/inventory');
}

export async function rejectOrder(orderId: string) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: 'REJECTED' },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'Order Rejected',
        entityType: 'Order',
        entityId: order.id,
      },
    });
  });

  revalidatePath('/admin/orders');
}
