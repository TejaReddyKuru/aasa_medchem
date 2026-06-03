'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DimensionType } from '@prisma/client';
import { calculatePrice, formatINR, convertToBaseUnit } from '@/lib/utils/conversions';
import Decimal from 'decimal.js';
import { createQuotation } from './actions';
import { useRouter } from 'next/navigation';

interface ProductInfo {
  id: string;
  name: string;
  dimensionType: DimensionType;
  baseUnit: string;
  pricePerBaseUnit: any;
  inventoryQuantity: any;
}

export function QuotationDialog({ product }: { product: ProductInfo }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('1');
  
  const defaultUnit = product.dimensionType === 'WEIGHT' ? 'kg' : product.dimensionType === 'VOLUME' ? 'L' : 'item';
  const [unit, setUnit] = useState(defaultUnit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsSubmitting(true);
    try {
      await createQuotation({
        productId: product.id,
        quantity,
        unit,
        dimension: product.dimensionType,
      });
      setOpen(false);
      router.push('/seller/quotations');
    } catch (e) {
      console.error(e);
      alert('Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  let estimatedPrice = 0;
  let convertedQty = new Decimal(0);
  let availableStock = new Decimal(product.inventoryQuantity);
  let remainingStock = new Decimal(0);
  let isExceeding = false;
  let isValidConversion = true;

  try {
    convertedQty = convertToBaseUnit(quantity || '0', unit, product.dimensionType);
    estimatedPrice = calculatePrice(quantity || '0', unit, product.dimensionType, product.pricePerBaseUnit).toNumber();
    remainingStock = availableStock.minus(convertedQty);
    isExceeding = remainingStock.isNegative();
  } catch (e) {
    isValidConversion = false;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full mt-4" />}>
        Request Quotation
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
          <DialogDescription>
            Request a quotation for {product.name}. The price is calculated in real-time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="col-span-2" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">Unit</Label>
            <Select value={unit} onValueChange={(val) => val && setUnit(val)}>
              <SelectTrigger className="col-span-2">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {product.dimensionType === 'WEIGHT' && (
                  <>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                  </>
                )}
                {product.dimensionType === 'VOLUME' && (
                  <>
                    <SelectItem value="L">Liters (L)</SelectItem>
                    <SelectItem value="mL">Milliliters (mL)</SelectItem>
                  </>
                )}
                {product.dimensionType === 'COUNT' && (
                  <SelectItem value="item">Items</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 space-y-2 p-4 bg-muted rounded-lg text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Available Stock:</span>
              <span>{availableStock.toString()} {product.baseUnit}</span>
            </div>
            {isValidConversion && (
              <>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Converted Requested:</span>
                  <span className={isExceeding ? 'text-destructive font-bold' : ''}>
                    {convertedQty.toString()} {product.baseUnit}
                  </span>
                </div>
                {!isExceeding && (
                  <div className="flex justify-between items-center text-muted-foreground border-b pb-2">
                    <span>Remaining After Approval:</span>
                    <span>{remainingStock.toString()} {product.baseUnit}</span>
                  </div>
                )}
                {isExceeding && (
                  <div className="text-destructive font-bold text-center mt-2 py-2 border border-destructive/20 bg-destructive/10 rounded-md">
                    Requested quantity exceeds available inventory
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="font-medium">Estimated Total:</span>
              <span className="text-lg font-bold text-primary">{formatINR(estimatedPrice)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isSubmitting || isExceeding || !isValidConversion} onClick={handleGenerate}>
            {isSubmitting ? 'Processing...' : 'Confirm Quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
