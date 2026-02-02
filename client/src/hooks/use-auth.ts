import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to sync user with our DB
  const syncMutation = useMutation({
    mutationFn: async (firebaseUser: FirebaseUser) => {
      const res = await fetch(api.users.sync.path, {
        method: api.users.sync.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "Gamer",
        }),
      });
      if (!res.ok) throw new Error("Failed to sync user");
      return api.users.sync.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user to DB whenever auth state changes to logged in
        syncMutation.mutate(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      queryClient.clear();
      toast({ title: "Signed Out", description: "See you next time." });
    } catch (error: any) {
      toast({ 
        title: "Logout Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  return { user, loading, login, logout };
}
