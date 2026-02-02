import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import ReactPlayer from "react-player";
import { useEpisode } from "@/hooks/use-games";
import { useProgress, useUpdateProgress } from "@/hooks/use-progress";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Pause, Maximize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type VideoNode } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Player() {
  const [, params] = useRoute("/play/:gameId/:episodeId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const gameId = parseInt(params?.gameId || "0");
  const episodeId = parseInt(params?.episodeId || "0");

  // Fetch Data
  const { data: profile } = useUserProfile(user?.uid);
  const { data: episode, isLoading: epLoading } = useEpisode(episodeId);
  const { data: progress, isLoading: progLoading } = useProgress(profile?.id || 0, episodeId);
  const { data: settings } = useSettings(profile?.id || 0);
  const updateSettings = useUpdateSettings();
  
  const updateProgress = useUpdateProgress();

  // Player State
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Menu pause (P)
  const [showSettings, setShowSettings] = useState(false); // In-player settings
  const [isSpacePaused, setIsSpacePaused] = useState(false); // HUD pause (Space)
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handlers
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (!document.fullscreenElement) return;

      if (key === "p") {
        e.preventDefault();
        if (showSettings) {
          setShowSettings(false);
        } else {
          setIsPaused(prev => {
            const newState = !prev;
            setPlaying(!newState);
            return newState;
          });
        }
      } else if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePaused(prev => !prev);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen, isPaused, showSettings]);

  // Initialize state when data is ready
  useEffect(() => {
    if (episode && !currentNodeId) {
      const struct = episode.structure as any;
      const startId = progress?.currentNodeId || struct?.startNodeId;
      if (startId) {
        setCurrentNodeId(startId);
      }
    }
  }, [episode, progress, currentNodeId]);

  if (epLoading || progLoading || !currentNodeId || !episode) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-white font-sans"><Loader2 className="animate-spin w-10 h-10" /></div>;
  }

  const structure = (episode.structure as any).nodes as Record<string, VideoNode>;
  const currentNode = structure[currentNodeId];

  if (!currentNode) {
    return <div className="bg-black text-white h-screen p-10 font-sans">Error: Node {currentNodeId} not found in structure.</div>;
  }

  // Handlers
  const handleProgress = (state: any) => {
    if (state && typeof state.playedSeconds === 'number') {
      setPlayedSeconds(state.playedSeconds);
    }
  };

  const handleEnded = () => {
    if (currentNode.choices && currentNode.choices.length > 0) {
      setShowChoices(true);
    } else {
      updateProgress.mutate({
        userId: profile!.id,
        episodeId,
        currentNodeId: currentNodeId,
        completed: true,
        choices: progress?.choices || [],
      });
      setLocation(`/games/${gameId}`);
    }
  };

  const handleChoice = (choice: any) => {
    const newChoices = [...(progress?.choices as any[] || []), { nodeId: currentNodeId, choiceId: choice.id }];
    
    updateProgress.mutate({
      userId: profile!.id,
      episodeId,
      currentNodeId: choice.nextNodeId,
      completed: false,
      choices: newChoices,
    });

    setShowChoices(false);
    setCurrentNodeId(choice.nextNodeId);
    setPlaying(true);
  };

  const currentSubtitle = currentNode.subtitles?.find(
    s => playedSeconds >= s.startTime && playedSeconds <= s.endTime
  );

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-black overflow-hidden font-sans group">
      {/* Fullscreen Guard */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white p-6 text-center">
          <Maximize className="w-16 h-16 mb-6 text-primary animate-pulse" />
          <h2 className="text-4xl font-display font-bold mb-4 uppercase tracking-widest">Fullscreen Required</h2>
          <p className="text-xl text-white/60 max-w-md mb-8">
            To provide the most immersive experience, this cinematic game requires fullscreen mode.
          </p>
          <Button size="lg" className="text-xl h-16 px-12" onClick={toggleFullscreen} data-testid="button-enter-fullscreen">
            Enter Fullscreen (F)
          </Button>
        </div>
      )}

      {/* ReactPlayer wrapper */}
      <div className="w-full h-full">
        <ReactPlayer
          ref={playerRef}
          url={currentNode.videoUrl}
          width="100%"
          height="100%"
          playing={playing && !isPaused && !isSpacePaused && isFullscreen}
          volume={(settings?.masterVolume ?? 10) / 10}
          muted={settings?.muteAll ?? false}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onError={(e: any) => console.log('ReactPlayer error (expected during navigation):', e)}
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Space Pause Overlay */}
      <AnimatePresence>
        {isSpacePaused && !isPaused && isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-[55] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-12 py-6 rounded-full border border-white/20">
              <h2 className="text-4xl font-display font-bold text-white uppercase tracking-[0.3em]">Paused</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Menu Overlay (P) */}
      <AnimatePresence>
        {isPaused && isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center"
          >
            <div className="flex flex-col gap-4 w-80">
              <h2 className="text-3xl font-display font-bold text-white mb-8 text-center uppercase tracking-widest">
                {showSettings ? "Settings" : "Paused"}
              </h2>
              
              {!showSettings ? (
                <>
                  <Button 
                    size="lg" 
                    className="w-full text-xl h-16" 
                    onClick={() => {
                      setIsPaused(false);
                      setPlaying(true);
                    }}
                    data-testid="button-resume"
                  >
                    Resume Game
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-xl h-16"
                    onClick={() => setShowSettings(true)}
                    data-testid="button-settings"
                  >
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full text-xl h-16"
                    onClick={() => {
                      setPlaying(false);
                      if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {}).finally(() => {
                          setTimeout(() => setLocation("/"), 50);
                        });
                      } else {
                        setLocation("/");
                      }
                    }}
                    data-testid="button-main-menu"
                  >
                    Main Menu
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full text-xl h-16"
                    onClick={() => window.close()}
                    data-testid="button-exit"
                  >
                    Exit Game
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-6 text-white overflow-y-auto max-h-[60vh] px-4 py-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase">Audio</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm opacity-60">Master Volume</label>
                        <span className="text-sm font-mono">{settings?.masterVolume ?? 10}</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" 
                        value={settings?.masterVolume ?? 10} 
                        onChange={(e) => updateSettings.mutate({ 
                          userId: profile!.id, 
                          updates: { masterVolume: parseInt(e.target.value) } 
                        })}
                        className="w-full accent-primary"
                        data-testid="input-master-volume"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm opacity-60">Music Volume</label>
                        <span className="text-sm font-mono">{settings?.musicVolume ?? 10}</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" 
                        value={settings?.musicVolume ?? 10} 
                        onChange={(e) => updateSettings.mutate({ 
                          userId: profile!.id, 
                          updates: { musicVolume: parseInt(e.target.value) } 
                        })}
                        className="w-full accent-primary"
                        data-testid="input-music-volume"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase">Accessibility</h3>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Subtitles</label>
                      <Button 
                        size="sm" variant={settings?.subtitles ? "default" : "outline"}
                        onClick={() => updateSettings.mutate({ 
                          userId: profile!.id, 
                          updates: { subtitles: !settings?.subtitles } 
                        })}
                        data-testid="button-toggle-subtitles"
                      >
                        {settings?.subtitles ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowSettings(false)}
                    data-testid="button-back-to-menu"
                  >
                    Back to Menu
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtitles Overlay */}
      {settings?.subtitles && currentSubtitle && isFullscreen && (
        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none z-30 px-10">
          <span 
            className={`
              bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm
              ${settings.subtitleSize === 'large' ? 'text-2xl' : settings.subtitleSize === 'small' ? 'text-sm' : 'text-lg'}
            `}
            data-testid="text-subtitle"
          >
            {currentSubtitle.text}
          </span>
        </div>
      )}

      {/* Choices Overlay */}
      <AnimatePresence>
        {showChoices && isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-8">
              {currentNode.choices?.map((choice, idx) => (
                <motion.button
                  key={choice.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleChoice(choice)}
                  className="
                    p-8 rounded-2xl border-2 border-white/20 bg-black/50 hover:bg-white/10 hover:border-primary hover:scale-105
                    transition-all duration-300 group text-left
                  "
                  data-testid={`button-choice-${idx}`}
                >
                  <span className="text-sm text-primary font-bold uppercase tracking-wider mb-2 block">Choice {idx + 1}</span>
                  <h3 className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">
                    {choice.text}
                  </h3>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
         <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="bg-black/50 border-white/20 text-white hover:bg-white/20"
              onClick={() => {
                setIsPaused(true);
                setPlaying(false);
              }}
              data-testid="button-pause-hud"
            >
              <Pause className="w-4 h-4 mr-2" /> Pause (P)
            </Button>
         </div>
      </div>
    </div>
  );
}
