'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendQuotationApprovalEmail } from '@/lib/utils/email';
import { formatINR } from '@/lib/utils/conversions';

export async function approveQuotation(quotationId: string) {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { user: true },
  });

  if (!quotation) throw new Error('Quotation not found');
  if (quotation.status !== 'GENERATED') throw new Error('Only GENERATED quotations can be approved');

  await prisma.$transaction(async (tx) => {
    // We update the quotation to be APPROVED
    await tx.quotation.update({
      where: { id: quotationId },
      data: { status: 'APPROVED' },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'Quotation Approved',
        entityType: 'Quotation',
        entityId: quotation.id,
      },
    });
  });

  // Dispatch email
  sendQuotationApprovalEmail(
    quotation.user.email,
    quotation.user.name || 'Seller',
    quotation.quotationNumber,
    formatINR(quotation.totalAmount)
  ).catch(e => console.error("Non-fatal email error:", e));

  revalidatePath('/admin/quotations');
  revalidatePath('/seller/quotations');
}
