import { DimensionType } from '@prisma/client';
import Decimal from 'decimal.js';

export const CONVERSION_RATES = {
  WEIGHT: {
    kg: new Decimal(1000), // 1 kg = 1000 g
    g: new Decimal(1),
  },
  VOLUME: {
    L: new Decimal(1000), // 1 L = 1000 mL
    mL: new Decimal(1),
  },
  COUNT: {
    item: new Decimal(1),
  },
};

/**
 * Converts a quantity from the requested unit to the base unit.
 * Example: 2 kg -> 2000 g
 */
export function convertToBaseUnit(
  quantity: number | string | Decimal,
  unit: string,
  dimension: DimensionType
): Decimal {
  const qty = new Decimal(quantity);
  
  if (dimension === 'WEIGHT') {
    if (unit === 'kg') return qty.mul(CONVERSION_RATES.WEIGHT.kg);
    if (unit === 'g') return qty;
    throw new Error(`Invalid unit '${unit}' for WEIGHT`);
  }
  
  if (dimension === 'VOLUME') {
    if (unit === 'L') return qty.mul(CONVERSION_RATES.VOLUME.L);
    if (unit === 'mL') return qty;
    throw new Error(`Invalid unit '${unit}' for VOLUME`);
  }
  
  if (dimension === 'COUNT') {
    if (unit === 'item') return qty;
    throw new Error(`Invalid unit '${unit}' for COUNT`);
  }
  
  throw new Error(`Invalid dimension type '${dimension}'`);
}

/**
 * Calculates the total price given a requested quantity, unit, and the product's base price.
 */
export function calculatePrice(
  requestedQuantity: number | string | Decimal,
  requestedUnit: string,
  dimension: DimensionType,
  pricePerBaseUnit: number | string | Decimal
): Decimal {
  const quantityInBase = convertToBaseUnit(requestedQuantity, requestedUnit, dimension);
  const basePrice = new Decimal(pricePerBaseUnit);
  return quantityInBase.mul(basePrice);
}

export function formatINR(value: number | Decimal): string {
  const val = new Decimal(value).toNumber();
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(val);
}
