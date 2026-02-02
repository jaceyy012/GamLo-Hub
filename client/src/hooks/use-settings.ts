import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UpdateSettingsRequest } from "@shared/routes";

export function useSettings(userId: number) {
  return useQuery({
    queryKey: [api.settings.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return api.settings.get.responses[200].parse(await res.json());
    },
    enabled: !!userId,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: number, updates: UpdateSettingsRequest }) => {
      const url = buildUrl(api.settings.update.path, { userId });
      const res = await fetch(url, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.settings.get.path, data.userId], data);
    },
  });
}
