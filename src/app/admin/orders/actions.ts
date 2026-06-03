'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import Decimal from 'decimal.js';
import { sendOrderStatusEmail } from '@/lib/utils/email';
import { formatINR } from '@/lib/utils/conversions';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order) throw new Error('Order not found');

  // If status is unchanged, do nothing
  if (order.status === newStatus) return;

  // If changing TO PROCESSING, perform strict inventory validation and deduction
  if (newStatus === 'PROCESSING' && order.status !== 'PROCESSING') {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        if (new Decimal(product.inventoryQuantity).lt(item.convertedQuantity)) {
          throw new Error(`Insufficient inventory available to process this order. Required: ${item.convertedQuantity.toString()}, Available: ${product.inventoryQuantity.toString()}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            inventoryQuantity: { decrement: item.convertedQuantity },
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            quantity: item.convertedQuantity,
            transactionType: 'ORDER_FULFILLMENT',
            remarks: `Fulfilled for Order ${order.orderNumber}`,
          }
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'Order status changed to PROCESSING (Inventory Deducted)',
          entityType: 'Order',
          entityId: order.id,
        },
      });
    });
  } else {
    // Standard status update without inventory impact
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: `Order status changed to ${newStatus}`,
          entityType: 'Order',
          entityId: order.id,
        },
      });
    });
  }

  // Dispatch email
  sendOrderStatusEmail(
    order.user.email,
    order.user.name || 'Seller',
    order.orderNumber,
    formatINR(order.totalAmount),
    newStatus,
    order.items
  ).catch(e => console.error("Non-fatal email error:", e));

  revalidatePath('/admin/orders');
  revalidatePath('/admin/inventory');
  revalidatePath('/seller/orders');
}
