import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { CinematicCard } from "@/components/CinematicCard";
import { useGames } from "@/hooks/use-games";
import { Loader2, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Games() {
  const [, setLocation] = useLocation();
  const { data: games, isLoading, error } = useGames();

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-destructive py-20">
          <h2 className="text-2xl font-bold">Error Loading Library</h2>
          <p>{error.message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-l-4 border-primary pl-6"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold">GAME LIBRARY</h1>
          <p className="text-muted-foreground mt-2 text-lg">Select a universe to enter.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games?.map((game, idx) => (
            <CinematicCard 
              key={game.id} 
              delay={idx * 0.1}
              onClick={() => setLocation(`/games/${game.id}`)}
              className="cursor-pointer group h-[400px]"
            >
              {/* Using descriptive Unsplash URLs for game covers */}
              <div className="absolute inset-0 z-0">
                {/* Fallback image if game.thumbnailUrl is empty */}
                <img 
                  src={game.thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"} 
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-gray-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    <PlayCircle className="w-5 h-5" />
                    <span>ENTER PORTAL</span>
                  </div>
                </div>
              </div>
            </CinematicCard>
          ))}

          {(!games || games.length === 0) && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              <p>No games found in the archives. Check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
