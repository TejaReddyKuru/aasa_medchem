import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatINR } from '@/lib/utils/conversions';

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED': return 'secondary';
      case 'UNDER_REVIEW': return 'secondary';
      case 'PROCESSING': return 'default';
      case 'SHIPPED': return 'default';
      case 'DELIVERED': return 'default';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCustomColorClass = (status: string) => {
    if (status === 'PROCESSING') return 'bg-blue-600';
    if (status === 'SHIPPED') return 'bg-purple-600';
    if (status === 'DELIVERED') return 'bg-green-600';
    return '';
  };

  const timelineSteps = ['ORDER_PLACED', 'UNDER_REVIEW', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
        <p className="text-muted-foreground">Monitor the real-time fulfillment progress of your orders.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const mainItem = order.items[0];
          const currentStepIndex = timelineSteps.indexOf(order.status);
          const isRejected = order.status === 'REJECTED';

          return (
            <div key={order.id} className="border rounded-lg bg-card text-card-foreground shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg mb-1">{order.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">Placed on {order.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-primary mb-1">{formatINR(order.totalAmount)}</p>
                  <Badge variant={getStatusColor(order.status) as any} className={getCustomColorClass(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-muted/30 p-4 rounded-md">
                <div className="font-medium">{mainItem?.product.name}</div>
                <div className="text-muted-foreground">|</div>
                <div className="text-sm">Requested: {mainItem?.orderedQuantity.toString()} {mainItem?.orderedUnit}</div>
                <div className="text-muted-foreground">|</div>
                <div className="text-sm text-muted-foreground">Base Eq: {mainItem?.convertedQuantity.toString()} {mainItem?.product.baseUnit}</div>
              </div>

              {/* Timeline Stepper */}
              {!isRejected ? (
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (timelineSteps.length - 1)) * 100}%` }}
                  ></div>
                  
                  <div className="relative z-10 flex justify-between">
                    {timelineSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                            ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-2 border-background'}
                            ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                          `}>
                            {isCompleted ? '✓' : ''}
                          </div>
                          <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                            {step.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-md text-center font-medium">
                  This order has been rejected. Please contact support.
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            You have not placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
