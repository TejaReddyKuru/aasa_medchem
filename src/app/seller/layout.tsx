import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { handleSignOut } from '@/app/actions';
import { ModeToggle } from '@/components/mode-toggle';

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== 'SELLER') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seller/dashboard" className="font-semibold text-lg">
            Seller Portal
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/seller/catalog" className="text-muted-foreground hover:text-foreground">Catalog</Link>
            <Link href="/seller/quotations" className="text-muted-foreground hover:text-foreground">Quotations</Link>
            <Link href="/seller/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
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
