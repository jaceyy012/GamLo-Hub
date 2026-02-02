import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Play, User, Settings, HelpCircle, Search, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user?.uid);
  const [search, setSearch] = useState("");

  const { data: recentProgress } = useQuery<any[]>({
    queryKey: ["/api/progress/recent", profile?.id],
    enabled: !!profile?.id,
  });

  const { data: games } = useQuery<any[]>({
    queryKey: ["/api/games"],
  });

  const filteredGames = games?.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  const menuItems = [
    { label: "Play", icon: Play, href: "/games", color: "bg-primary" },
    { label: "Account", icon: User, href: "/account", color: "bg-blue-600" },
    { label: "Settings", icon: Settings, href: "/settings", color: "bg-emerald-600" },
    { label: "Help", icon: HelpCircle, href: "/help", color: "bg-orange-600" },
  ];

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 text-glow">
            GAMLO STUDIOS
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
            YOUR CHOICES • YOUR STORY • YOUR FATE
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto w-full px-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search library..." 
              className="pl-12 h-14 text-lg bg-card/50 border-white/10 rounded-2xl focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-games"
            />
          </div>
        </div>

        {/* Continue Watching */}
        {recentProgress && recentProgress.length > 0 && !search && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-display font-bold uppercase tracking-widest">Continue Watching</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 px-1">
              {recentProgress.map((prog) => (
                <motion.div
                  key={prog.id}
                  whileHover={{ scale: 1.05 }}
                  className="min-w-[300px] h-44 bg-card rounded-2xl border border-white/10 overflow-hidden relative cursor-pointer group"
                  onClick={() => setLocation(`/play/${prog.gameId}/${prog.episodeId}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 space-y-1">
                    <p className="text-xs text-primary font-bold uppercase">Resume Mission</p>
                    <h3 className="text-xl font-bold truncate">Episode {prog.episodeId}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Grid Navigation */}
        {!search ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Button
                  onClick={() => setLocation(item.href)}
                  className="w-full h-48 md:h-64 rounded-3xl relative overflow-hidden border-0 bg-card hover:bg-card transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl hover:shadow-primary/20"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${item.color}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className="p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300">
                      <item.icon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    </div>
                    <span className="text-2xl md:text-3xl font-display font-bold tracking-widest uppercase">
                      {item.label}
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-4">
             {filteredGames?.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-card rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:border-primary transition-all"
                  onClick={() => setLocation(`/games/${game.id}`)}
                >
                  <img src={game.thumbnailUrl} className="w-full aspect-video object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{game.title}</h3>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
