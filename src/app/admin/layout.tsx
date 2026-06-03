import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { handleSignOut } from '@/app/actions';
import { ModeToggle } from '@/components/mode-toggle';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="font-semibold text-lg">
            Admin Dashboard
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products & Inventory</Link>
            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <span className="text-sm font-medium">{session.user.name}</span>
          <form action={handleSignOut}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
