import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertProgress } from "@shared/routes";

export function useProgress(userId: number, episodeId: number) {
  return useQuery({
    queryKey: [api.progress.get.path, userId, episodeId],
    queryFn: async () => {
      const url = buildUrl(api.progress.get.path, { userId, episodeId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch progress");
      // Could be undefined if no progress yet, so we handle optional return
      const data = await res.json();
      return api.progress.get.responses[200].parse(data);
    },
    enabled: !!userId && !!episodeId,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProgress) => {
      const res = await fetch(api.progress.update.path, {
        method: api.progress.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save progress");
      return api.progress.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: [api.progress.get.path, data.userId, data.episodeId] 
      });
    },
  });
}
