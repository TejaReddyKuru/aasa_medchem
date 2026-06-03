'use client';

import { useActionState, useState } from 'react';
import { createProduct, updateProduct } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DimensionType } from '@prisma/client';

export function ProductForm({ product }: { product?: any }) {
  const [dimensionType, setDimensionType] = useState<DimensionType>(
    product?.dimensionType || 'WEIGHT'
  );
  
  const action = product ? updateProduct.bind(null, product.id) : createProduct;
  const [errorMessage, formAction, isPending] = useActionState(action, undefined);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={product?.category} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dimensionType">Dimension Type</Label>
              <Select 
                name="dimensionType" 
                value={dimensionType} 
                onValueChange={(v) => setDimensionType(v as DimensionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEIGHT">Weight</SelectItem>
                  <SelectItem value="VOLUME">Volume</SelectItem>
                  <SelectItem value="COUNT">Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUnit">Base Unit</Label>
              <Select name="baseUnit" defaultValue={product?.baseUnit || (dimensionType === 'WEIGHT' ? 'g' : dimensionType === 'VOLUME' ? 'mL' : 'item')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dimensionType === 'WEIGHT' && <SelectItem value="g">Grams (g)</SelectItem>}
                  {dimensionType === 'VOLUME' && <SelectItem value="mL">Milliliters (mL)</SelectItem>}
                  {dimensionType === 'COUNT' && <SelectItem value="item">Item</SelectItem>}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">All inventory calculations run strictly in the Base Unit.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerBaseUnit">Price per Base Unit (₹)</Label>
              <Input 
                id="pricePerBaseUnit" 
                name="pricePerBaseUnit" 
                type="number" 
                step="0.0001" 
                defaultValue={product?.pricePerBaseUnit?.toString()} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" defaultValue={product?.description} />
          </div>

          {errorMessage && <div className="text-sm text-destructive">{errorMessage}</div>}
          
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
