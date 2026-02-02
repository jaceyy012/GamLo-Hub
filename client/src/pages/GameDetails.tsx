import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useGame, useEpisodes } from "@/hooks/use-games";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Lock, Play, Calendar, Book, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GameDetails() {
  const [, params] = useRoute("/games/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const gameId = parseInt(params?.id || "0");
  
  const { data: game, isLoading: gameLoading } = useGame(gameId);
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(gameId);
  
  const { data: characters } = useQuery<any[]>({
    queryKey: ["/api/games", gameId, "characters"],
    enabled: !!gameId,
  });

  if (gameLoading || episodesLoading) return <Layout><div className="h-[60vh] grid place-items-center"><Loader2 className="animate-spin" /></div></Layout>;
  if (!game) return <Layout><div>Game not found</div></Layout>;

  return (
    <Layout>
      <div className="relative -mx-4 -mt-8 mb-12 h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={game.backgroundUrl} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end relative z-10 pb-16">
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl md:text-9xl font-display font-black text-white mb-6 tracking-tighter uppercase leading-none">{game.title}</motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl md:text-3xl text-gray-200 max-w-4xl font-light leading-snug">{game.description}</motion.p>
        </div>
      </div>

      <Tabs defaultValue="episodes" className="w-full">
        <TabsList className="bg-card/50 border border-white/10 p-1 rounded-2xl mb-12">
          <TabsTrigger value="episodes" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold tracking-widest">
            <Play className="w-4 h-4 mr-2" /> Episodes
          </TabsTrigger>
          <TabsTrigger value="lore" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold tracking-widest">
            <Book className="w-4 h-4 mr-2" /> Lore
          </TabsTrigger>
          <TabsTrigger value="characters" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-bold tracking-widest">
            <Users className="w-4 h-4 mr-2" /> Characters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="episodes" className="space-y-6">
          <div className="grid gap-6">
            {episodes?.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 border border-white/5 rounded-2xl p-8 hover:bg-card hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-primary font-bold uppercase tracking-[0.2em]">
                      <span>Season {episode.seasonNumber}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      <span>Episode {episode.episodeNumber}</span>
                    </div>
                    <h3 className="text-3xl font-bold group-hover:text-primary transition-colors uppercase tracking-tight">{episode.title}</h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">{episode.description}</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="h-16 px-12 text-xl font-black uppercase"
                    onClick={() => setLocation(`/play/${gameId}/${episode.id}`)}
                    disabled={!episode.isFree}
                  >
                    {!episode.isFree ? <><Lock className="w-5 h-5 mr-2" /> Locked</> : <><Play className="w-5 h-5 mr-2 fill-current" /> Play</>}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lore" className="space-y-8 max-w-4xl">
          <Card className="bg-card/30 border-white/10 backdrop-blur-md">
            <CardContent className="p-12 space-y-6">
              <h2 className="text-4xl font-display font-bold uppercase tracking-widest text-primary">Archives</h2>
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="text-xl leading-loose text-gray-300 italic">
                  {game.lore || "No historical records found for this sector."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters?.length ? characters.map(char => (
            <motion.div key={char.id} whileHover={{ y: -10 }} className="bg-card/30 border border-white/10 rounded-3xl overflow-hidden group">
              <div className="aspect-[3/4] relative">
                <img src={char.imageUrl || "https://placehold.co/600x800"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{char.role}</p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{char.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground leading-relaxed">{char.description}</p>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full p-20 text-center border-2 border-dashed border-white/10 rounded-3xl text-muted-foreground text-2xl font-light">
              Personnel files encrypted. No data available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
