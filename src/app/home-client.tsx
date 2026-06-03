'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, ArrowRight, Beaker, Package } from 'lucide-react';

export function HomeClient({ session, products }: { session: any, products: any[] }) {
  const role = session?.user?.role;

  return (
    <div className="min-h-screen bg-[#F8FBFF] overflow-hidden text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-300/30 blur-[120px] mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-300/30 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-200/30 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Dynamic Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl"
      >
        <div className="flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MedChem</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            {role === 'ADMIN' ? (
              <>
                <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link href="/admin/products" className="hover:text-blue-600 transition-colors">Products & Inventory</Link>
                <Link href="/admin/orders" className="hover:text-blue-600 transition-colors">Orders</Link>
              </>
            ) : role === 'SELLER' ? (
              <>
                <Link href="/seller/catalog" className="hover:text-blue-600 transition-colors">Catalog</Link>
                <Link href="/seller/quotations" className="hover:text-blue-600 transition-colors">Quotations</Link>
                <Link href="/seller/orders" className="hover:text-blue-600 transition-colors">Orders</Link>
              </>
            ) : (
              <span className="text-slate-400 italic">Welcome to MedChem Chemical Marketplace</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!session ? (
              <Link href="/login">
                <Button className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-105">
                  Sign In to Order
                </Button>
              </Link>
            ) : (
              <Link href={role === 'ADMIN' ? '/admin/dashboard' : '/seller/catalog'}>
                <Button className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all hover:scale-105">
                  Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <div className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4"
          >
            Live Chemical Inventory
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Browse our globally sourced, high-grade medical chemicals and place your orders instantly through our verified marketplace.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group relative p-6 rounded-[24px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-default"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                    <Beaker className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    {product.sku}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-1">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{product.category}</p>
                
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Package className="w-4 h-4"/> Pricing</span>
                    <span className="font-semibold text-slate-900">₹{product.pricePerBaseUnit} / {product.baseUnit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {products.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 font-medium">
              No products available in the inventory yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
