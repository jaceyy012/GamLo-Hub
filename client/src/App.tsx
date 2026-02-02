import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Games from "@/pages/Games";
import GameDetails from "@/pages/GameDetails";
import Player from "@/pages/Player";
import Account from "@/pages/Account";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import { useEffect, useState } from "react";

function MobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center font-sans">
        <h1 className="text-6xl font-display font-bold mb-6 text-primary">403</h1>
        <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-widest">Forbidden</h2>
        <p className="text-xl text-white/60 max-w-md">
          This cinematic experience is exclusive to desktop devices. Your current device is not supported.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games" component={Games} />
      <Route path="/games/:id" component={GameDetails} />
      <Route path="/play/:gameId/:episodeId" component={Player} />
      <Route path="/account" component={Account} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileGuard>
          <Toaster />
          <Router />
        </MobileGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
