import { Navigation } from "./Navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-foreground font-body selection:bg-primary selection:text-white pb-20 md:pb-0">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="hidden md:block py-8 text-center text-muted-foreground text-sm border-t border-white/5 mt-auto">
          <p>&copy; {new Date().getFullYear()} GamLo Studios. All rights reserved.</p>
        </footer>
      </div>
      
      {/* Background ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none z-0" />
    </div>
  );
}
