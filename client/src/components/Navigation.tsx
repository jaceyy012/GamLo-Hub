import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Play, User, Settings, HelpCircle, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/games", label: "Play", icon: Play },
    { href: "/account", label: "Account", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-white/10 md:static md:border-t-0 md:bg-transparent md:mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="hidden md:flex items-center gap-2 text-2xl font-display font-bold text-primary hover:text-primary/80 transition-colors">
            <Film className="w-8 h-8" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">GAMLO STUDIOS</span>
          </Link>

          <ul className="flex flex-1 justify-around md:justify-end md:gap-8">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href}>
                  <div className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group cursor-pointer",
                    location === href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    {location === href && (
                      <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="w-6 h-6 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-sm font-medium uppercase tracking-wider">{label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
