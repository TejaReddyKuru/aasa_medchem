'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { convertToOrder } from './actions';

export function PlaceOrderButton({ quotationId }: { quotationId: string }) {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS'>('IDLE');

  const handleClick = async () => {
    setStatus('LOADING');
    try {
      await convertToOrder(quotationId);
      setStatus('SUCCESS');
      // The server action has a revalidatePath which will trigger a page refresh.
      // But we set SUCCESS to show the animation right before the row disappears.
    } catch (error: any) {
      alert(error.message || 'Failed to place order');
      setStatus('IDLE');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <Button 
        size="sm" 
        className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300 w-32"
        disabled
      >
        ✓ Order Placed!
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      onClick={handleClick} 
      disabled={status === 'LOADING'}
      className="transition-all duration-300 w-32"
    >
      {status === 'LOADING' ? (
        <span className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
          Processing
        </span>
      ) : (
        'Place Order'
      )}
    </Button>
  );
}
