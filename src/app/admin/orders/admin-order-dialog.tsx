'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus } from './actions';
import Decimal from 'decimal.js';

export function AdminOrderDialog({ 
  orderId, 
  orderNumber, 
  initialStatus, 
  productName, 
  baseUnit, 
  inventoryQuantity, 
  convertedQuantity 
}: { 
  orderId: string;
  orderNumber: string;
  initialStatus: string;
  productName: string;
  baseUnit: string;
  inventoryQuantity: string;
  convertedQuantity: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const availableStock = new Decimal(inventoryQuantity);
  const orderedQty = new Decimal(convertedQuantity);
  const remainingStock = availableStock.minus(orderedQty);
  const isSufficient = remainingStock.gte(0);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, status);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Manage
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Management: {orderNumber}</DialogTitle>
          <DialogDescription>
            Update the lifecycle status of this order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4 border rounded-md p-4 bg-muted/30">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Inventory Impact Analysis</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{productName}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Available Inventory:</span>
              <span className="font-medium">{availableStock.toString()} {baseUnit}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Ordered Quantity:</span>
              <span className="font-medium">{orderedQty.toString()} {baseUnit}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Remaining After Processing:</span>
              <span className={`font-bold ${isSufficient ? 'text-primary' : 'text-destructive'}`}>
                {remainingStock.toString()} {baseUnit}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t">
              {isSufficient ? (
                <div className="flex items-center text-green-600 font-medium text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                  🟢 Sufficient Stock
                </div>
              ) : (
                <div className="flex items-center text-destructive font-medium text-sm">
                  <div className="w-2 h-2 rounded-full bg-destructive mr-2"></div>
                  🔴 Insufficient Stock
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Change Order Status</label>
            <Select value={status} onValueChange={(val) => val && setStatus(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORDER_PLACED">ORDER PLACED</SelectItem>
                <SelectItem value="UNDER_REVIEW">UNDER REVIEW</SelectItem>
                <SelectItem value="PROCESSING">PROCESSING (Deducts Stock)</SelectItem>
                <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            disabled={isUpdating || (status === 'PROCESSING' && !isSufficient)} 
            onClick={handleUpdate}
            className="w-full sm:w-auto"
          >
            {isUpdating ? 'Updating...' : 'Confirm Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
