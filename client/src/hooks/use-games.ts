import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// GET /api/games
export function useGames() {
  return useQuery({
    queryKey: [api.games.list.path],
    queryFn: async () => {
      const res = await fetch(api.games.list.path);
      if (!res.ok) throw new Error("Failed to fetch games");
      return api.games.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/games/:id
export function useGame(id: number) {
  return useQuery({
    queryKey: [api.games.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.games.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch game details");
      return api.games.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// GET /api/games/:gameId/episodes
export function useEpisodes(gameId: number) {
  return useQuery({
    queryKey: [api.episodes.list.path, gameId],
    queryFn: async () => {
      const url = buildUrl(api.episodes.list.path, { gameId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch episodes");
      return api.episodes.list.responses[200].parse(await res.json());
    },
    enabled: !!gameId,
  });
}

// GET /api/episodes/:id
export function useEpisode(id: number) {
  return useQuery({
    queryKey: [api.episodes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.episodes.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch episode");
      return api.episodes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
