import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useUserProfile(firebaseUid: string | undefined) {
  return useQuery({
    queryKey: [api.users.me.path, firebaseUid],
    queryFn: async () => {
      if (!firebaseUid) return null;
      const url = buildUrl(api.users.me.path, { firebaseUid });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.users.me.responses[200].parse(await res.json());
    },
    enabled: !!firebaseUid,
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (firebaseUid: string) => {
      const url = buildUrl(api.users.delete.path, { firebaseUid });
      const res = await fetch(url, { method: api.users.delete.method });
      if (!res.ok) throw new Error("Failed to delete account");
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}
