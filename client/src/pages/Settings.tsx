import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Volume2, Ear, Monitor, Type } from "lucide-react";
import { useLocation } from "wouter";

export default function Settings() {
  const { user, login } = useAuth();
  const { data: profile } = useUserProfile(user?.uid);
  const { data: settings, isLoading } = useSettings(profile?.id || 0);
  const updateSettings = useUpdateSettings();
  const [, setLocation] = useLocation();

  // Local state for sliders to prevent janky updates
  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20 space-y-4">
          <h1 className="text-2xl font-bold">Restricted Area</h1>
          <p>Please sign in to configure your neural interface.</p>
          <Button onClick={login}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  if (isLoading || !localSettings) return <Layout><div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div></Layout>;

  const handleUpdate = (updates: any) => {
    // Optimistic update
    setLocalSettings({ ...localSettings, ...updates });
    // API call
    updateSettings.mutate({ userId: profile!.id, updates });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8 pb-20">
         <div className="border-l-4 border-emerald-500 pl-6">
          <h1 className="text-4xl font-display font-bold text-white">SYSTEM CONFIGURATION</h1>
          <p className="text-emerald-500/80 mt-1 font-mono tracking-widest text-sm">INTERFACE_V4.2 // SETTINGS</p>
        </div>

        {/* Audio Section */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5 text-emerald-500"/> Audio</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Master Volume</label>
                <span className="text-xs font-mono text-muted-foreground">{localSettings.masterVolume * 10}%</span>
              </div>
              <Slider 
                value={[localSettings.masterVolume]} 
                max={10} 
                step={1} 
                onValueChange={([val]) => handleUpdate({ masterVolume: val })}
                className="py-2"
              />
            </div>
            
             <div className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Music Volume</label>
                <span className="text-xs font-mono text-muted-foreground">{localSettings.musicVolume * 10}%</span>
              </div>
              <Slider 
                value={[localSettings.musicVolume]} 
                max={10} 
                step={1} 
                onValueChange={([val]) => handleUpdate({ musicVolume: val })}
                className="py-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mute All Audio</label>
              <Switch 
                checked={localSettings.muteAll}
                onCheckedChange={(checked) => handleUpdate({ muteAll: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="bg-card/50 border-white/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Ear className="w-5 h-5 text-emerald-500"/> Accessibility</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Subtitles</label>
              <Switch 
                checked={localSettings.subtitles}
                onCheckedChange={(checked) => handleUpdate({ subtitles: checked })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm text-muted-foreground">Size</label>
                 <Select 
                   value={localSettings.subtitleSize} 
                   onValueChange={(val) => handleUpdate({ subtitleSize: val })}
                 >
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="small">Small</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="large">Large</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
                <div className="space-y-2">
                 <label className="text-sm text-muted-foreground">Language</label>
                 <Select 
                   value={localSettings.subtitleLanguage} 
                   onValueChange={(val) => handleUpdate({ subtitleLanguage: val })}
                   disabled
                 >
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="English">English</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Behavior */}
         <Card className="bg-card/50 border-white/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5 text-emerald-500"/> Portal Behavior</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             {[
               { key: 'autoPlayNext', label: 'Auto-Play Next Episode' },
               { key: 'releaseDateCountdown', label: 'Show Release Countdowns' },
               { key: 'recaps', label: 'Play Episode Recaps' },
               { key: 'choiceRecaps', label: 'Show Choice Summary' },
             ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <label className="text-sm font-medium">{item.label}</label>
                  <Switch 
                    checked={localSettings[item.key]}
                    onCheckedChange={(checked) => handleUpdate({ [item.key]: checked })}
                  />
                </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
