'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adjustInventory } from './inventory-actions';

export function AdjustDialog({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('0');
  const [operation, setOperation] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjust = async () => {
    setIsSubmitting(true);
    try {
      await adjustInventory(product.id, quantity, operation, remarks);
      setOpen(false);
      setQuantity('0');
      setRemarks('');
    } catch (e: any) {
      alert(e.message || 'Failed to adjust inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Inventory: {product.name}</DialogTitle>
          <DialogDescription>
            Current stock is {product.inventoryQuantity.toString()} {product.baseUnit}. All adjustments are logged.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="operation" className="text-right">Action</Label>
            <Select value={operation} onValueChange={(v) => setOperation(v as 'ADD' | 'SUBTRACT')}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADD">Add Stock (IN)</SelectItem>
                <SelectItem value="SUBTRACT">Remove Stock (OUT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">Quantity</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input 
                id="quantity" 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
              />
              <span className="text-sm text-muted-foreground">{product.baseUnit}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remarks" className="text-right">Remarks</Label>
            <Input 
              id="remarks" 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
              className="col-span-3" 
              placeholder="e.g. Supplier delivery"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting} onClick={handleAdjust}>
            {isSubmitting ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
