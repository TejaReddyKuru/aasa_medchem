'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils/conversions';

export function AdminQuotationDialog({ quotation }: { quotation: any }) {
  const [open, setOpen] = useState(false);
  const item = quotation.items[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quotation Details</DialogTitle>
          <DialogDescription>
            Generated on {quotation.createdAt.toLocaleDateString()} at {quotation.createdAt.toLocaleTimeString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Customer Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{quotation.user.name}</span>
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{quotation.user.email}</span>
              <span className="text-muted-foreground">Role ID:</span>
              <span className="font-medium text-xs">{quotation.user.id}</span>
            </div>
          </div>

          <div className="space-y-2 border-b pb-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Product Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Item:</span>
              <span className="font-medium">{item.product.name} ({item.product.sku})</span>
              <span className="text-muted-foreground">Requested Qty:</span>
              <span className="font-medium">{item.requestedQuantity.toString()} {item.requestedUnit}</span>
              <span className="text-muted-foreground">Base Unit Equivalent:</span>
              <span className="font-medium">{item.convertedQuantity.toString()} {item.product.baseUnit}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Financials</h3>
            <div className="grid grid-cols-2 gap-2 text-sm items-center">
              <span className="text-muted-foreground">Unit Price:</span>
              <span className="font-medium">{formatINR(item.unitPrice)} / {item.product.baseUnit}</span>
              <span className="text-muted-foreground font-bold">Total Amount:</span>
              <span className="font-bold text-lg text-primary">{formatINR(quotation.totalAmount)}</span>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={quotation.status === 'GENERATED' ? 'default' : 'secondary'} className="w-fit">
                {quotation.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
