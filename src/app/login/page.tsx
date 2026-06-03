import { LoginForm } from './login-form';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/20">
      
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col items-center justify-center text-primary-foreground p-12 relative overflow-hidden">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" style={{ backgroundSize: '20px 20px', backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shadow-2xl mb-4 p-4">
            <Logo className="w-full h-full text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Chemix Portal</h1>
          <p className="text-primary-foreground/80 max-w-sm text-sm font-medium">
            Premium High-Density Technical Workspace
            <br />
            ERP Integrated Environment
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-background relative">
        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>
      </div>
      
    </div>
  );
}
