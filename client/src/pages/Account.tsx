import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile, useDeleteAccount } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, LogOut, Trash2, Trophy, History, Camera, Check } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Account() {
  const { user, login, logout, loading } = useAuth();
  const { data: profile } = useUserProfile(user?.uid);
  const deleteAccount = useDeleteAccount();
  const [, setLocation] = useLocation();

  const [editName, setEditName] = useState("");
  const [editPic, setEditPic] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: achievements } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", profile?.id],
    enabled: !!profile?.id,
  });

  const { data: progressList } = useQuery<any[]>({
    queryKey: ["/api/progress/user", profile?.id],
    enabled: !!profile?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("PATCH", `/api/users/${user?.uid}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.uid}`] });
      setIsEditing(false);
    }
  });

  const handleDelete = () => {
    if (confirm("Are you sure? This action is irreversible. All progress across all timelines will be erased.")) {
      deleteAccount.mutate(user!.uid, {
        onSuccess: () => {
          logout();
          setLocation("/");
        }
      });
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div></Layout>;

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <h1 className="text-4xl font-display font-bold">ACCESS DENIED</h1>
          <p className="text-muted-foreground text-lg max-w-md">Initialize identification to access archives.</p>
          <Button onClick={login} size="lg">Sign In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="border-l-4 border-primary pl-6">
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Operative Profile</h1>
          <p className="text-muted-foreground mt-1">Timeline status: Verified</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-card/50 border-white/10 backdrop-blur-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/20 to-blue-600/20" />
              <CardContent className="relative pt-0">
                <div className="flex flex-col items-center -mt-12 mb-6">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                    <AvatarImage src={profile?.profilePicture || ""} />
                    <AvatarFallback className="bg-primary/20"><User className="w-12 h-12 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="mt-4 text-center">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input 
                          placeholder="Display Name" 
                          value={editName || profile?.displayName || ""} 
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <Input 
                          placeholder="Profile Pic URL" 
                          value={editPic || profile?.profilePicture || ""} 
                          onChange={(e) => setEditPic(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateProfile.mutate({ displayName: editName, profilePicture: editPic })}>
                            <Check className="w-4 h-4 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">{profile?.displayName || user.displayName}</h2>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => setIsEditing(true)}>
                          Customize Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Enlisted</span>
                    <span className="font-mono">{profile?.createdAt ? formatDistanceToNow(new Date(profile.createdAt)) : "---"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Clearance</span>
                    <span className="text-green-500 font-bold uppercase">Level 1</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-8">
                  <Button variant="outline" className="w-full justify-start" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" /> Disengage
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" /> Erase Identity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Progress & Achievements */}
          <div className="md:col-span-2 space-y-8">
            {/* Achievements */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-display font-bold uppercase tracking-widest">Achievements</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {achievements?.length ? achievements.map(ach => (
                  <div key={ach.id} className="p-4 bg-card/30 border border-white/5 rounded-xl text-center space-y-2">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="font-bold text-sm truncate">{ach.title}</p>
                  </div>
                )) : (
                  <div className="col-span-full p-8 text-center bg-card/20 rounded-xl border border-dashed border-white/10 text-muted-foreground">
                    No achievements unlocked in this timeline.
                  </div>
                )}
              </div>
            </section>

            {/* Decisions Recap */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold uppercase tracking-widest">Mission Logs (Choices)</h2>
              </div>
              <div className="space-y-4">
                {progressList?.length ? progressList.map(prog => (
                  <Card key={prog.id} className="bg-card/30 border-white/10">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg">Episode {prog.episodeId}</CardTitle>
                      <CardDescription>Last updated {formatDistanceToNow(new Date(prog.updatedAt))} ago</CardDescription>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                      <div className="space-y-2">
                        {(prog.choices as any[] || []).map((c, i) => (
                          <div key={i} className="flex justify-between text-sm p-2 bg-background/50 rounded border border-white/5">
                            <span className="text-muted-foreground">Node {c.nodeId}</span>
                            <span className="text-primary font-bold">Choice ID: {c.choiceId}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="p-8 text-center bg-card/20 rounded-xl border border-dashed border-white/10 text-muted-foreground">
                    No mission logs found.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
