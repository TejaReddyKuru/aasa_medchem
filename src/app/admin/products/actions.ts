'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import Decimal from 'decimal.js';
import { DimensionType } from '@prisma/client';

const ProductSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  dimensionType: z.enum(['WEIGHT', 'VOLUME', 'COUNT']),
  baseUnit: z.string().min(1, "Base Unit is required"),
  pricePerBaseUnit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valid price is required"),
});

export async function createProduct(prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return 'Unauthorized';

  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = ProductSchema.safeParse(rawData);

    if (!validatedData.success) {
      return validatedData.error.errors[0].message;
    }

    const { sku, name, category, description, dimensionType, baseUnit, pricePerBaseUnit } = validatedData.data;

    // Verify SKU uniqueness
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) return 'A product with this SKU already exists';

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sku,
          name,
          category,
          description: description || '',
          dimensionType: dimensionType as DimensionType,
          baseUnit,
          pricePerBaseUnit: new Decimal(pricePerBaseUnit),
          inventoryQuantity: new Decimal(0), // initial stock is always 0
          minimumStockLevel: new Decimal(100), // Default 100 base units for alerts
        }
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'Created Product',
          entityType: 'Product',
          entityId: product.id,
        }
      });
    });
  } catch (error) {
    console.error(error);
    return 'Failed to create product';
  }

  revalidatePath('/admin/products');
  revalidatePath('/seller/catalog');
  redirect('/admin/products');
}

export async function updateProduct(productId: string, prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') return 'Unauthorized';

  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = ProductSchema.safeParse(rawData);

    if (!validatedData.success) {
      return validatedData.error.errors[0].message;
    }

    const { sku, name, category, description, dimensionType, baseUnit, pricePerBaseUnit } = validatedData.data;

    // Verify SKU uniqueness if changed
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing && existing.id !== productId) return 'A different product with this SKU already exists';

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          sku,
          name,
          category,
          description: description || '',
          dimensionType: dimensionType as DimensionType,
          baseUnit,
          pricePerBaseUnit: new Decimal(pricePerBaseUnit),
        }
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'Updated Product',
          entityType: 'Product',
          entityId: productId,
        }
      });
    });
  } catch (error) {
    console.error(error);
    return 'Failed to update product';
  }

  revalidatePath('/admin/products');
  revalidatePath('/seller/catalog');
  redirect('/admin/products');
}
