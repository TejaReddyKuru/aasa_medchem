'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import Decimal from 'decimal.js';

export async function adjustInventory(
  productId: string, 
  quantity: string, 
  operation: 'ADD' | 'SUBTRACT', 
  remarks: string
) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const adjustQty = new Decimal(quantity);
  if (adjustQty.lte(0)) throw new Error('Quantity must be greater than 0');

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    if (operation === 'SUBTRACT' && new Decimal(product.inventoryQuantity).lt(adjustQty)) {
      throw new Error(`Insufficient stock. Only ${product.inventoryQuantity.toString()} left.`);
    }

    // 1. Adjust Stock
    await tx.product.update({
      where: { id: productId },
      data: {
        inventoryQuantity: operation === 'ADD' ? { increment: adjustQty } : { decrement: adjustQty },
      },
    });

    // 2. Record Transaction
    await tx.inventoryTransaction.create({
      data: {
        productId,
        quantity: adjustQty,
        transactionType: operation === 'ADD' ? 'STOCK_IN' : 'STOCK_OUT',
        remarks: remarks || `Manual adjustment by admin`,
      }
    });

    // 3. Audit Log
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: `Inventory Adjusted (${operation})`,
        entityType: 'Product',
        entityId: productId,
      }
    });
  });

  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  revalidatePath('/seller/catalog');
}
