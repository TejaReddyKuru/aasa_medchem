import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { handleSignOut } from '@/app/actions';
import { ModeToggle } from '@/components/mode-toggle';
import { Search, Bell, LayoutDashboard, Package, FileText, ShoppingCart, Settings } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== 'SELLER') {
    redirect('/login');
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/seller/dashboard' },
    { name: 'Catalog', icon: Package, href: '/seller/catalog' },
    { name: 'Quotations', icon: FileText, href: '/seller/quotations' },
    { name: 'Orders', icon: ShoppingCart, href: '/seller/orders' },
    { name: 'Settings', icon: Settings, href: '/seller/dashboard' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="w-64 h-full border-r border-border bg-card flex flex-col justify-between p-4 z-20">
        <div className="space-y-6">
          <Link href="/seller/dashboard" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground p-1.5 shadow-sm">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-mono font-bold tracking-wider text-sm">CHEMIX // PORTAL</span>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <Link key={idx} href={item.href} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded hover:bg-accent hover:text-accent-foreground transition-colors group">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted group-hover:bg-background px-1.5 py-0.5 rounded border border-transparent group-hover:border-border">⌥{idx+1}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Framework Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Frame */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="w-96 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search catalog, CAS#, quotes... ( Press '/' )" className="w-full pl-9 pr-4 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:border-primary transition-all font-mono text-foreground" />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <button className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-[10px] font-mono font-bold text-secondary-foreground border border-border">
                {session.user.name?.substring(0, 2).toUpperCase() || 'SE'}
              </div>
              <form action={handleSignOut}>
                <button type="submit" className="px-3 py-1.5 text-xs font-medium rounded bg-card border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Content Node Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
