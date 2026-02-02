import { z } from "zod";
import { 
  insertUserSchema, 
  insertGameSchema, 
  insertEpisodeSchema, 
  insertProgressSchema, 
  insertSettingsSchema,
  users,
  games,
  episodes,
  userProgress,
  userSettings,
  characters,
  achievements
} from "./schema";

// --- Validation Helpers ---
const idParam = z.object({ id: z.coerce.number() });
const userIdParam = z.object({ userId: z.coerce.number() });

// --- Schemas ---
export const userSchema = z.custom<typeof users.$inferSelect>();
export const gameSchema = z.custom<typeof games.$inferSelect>();
export const characterSchema = z.custom<typeof characters.$inferSelect>();
export const episodeSchema = z.custom<typeof episodes.$inferSelect>();
export const achievementSchema = z.custom<typeof achievements.$inferSelect>();
export const progressSchema = z.custom<typeof userProgress.$inferSelect>();
export const settingsSchema = z.custom<typeof userSettings.$inferSelect>();

export const updateSettingsRequestSchema = insertSettingsSchema.partial();
export type UpdateSettingsRequest = z.infer<typeof updateSettingsRequestSchema>;

export const syncUserRequestSchema = insertUserSchema;

export const updateProgressRequestSchema = insertProgressSchema;

// --- API Contract Definition ---
export const api = {
  users: {
    sync: {
      method: "POST",
      path: "/api/users/sync",
      input: syncUserRequestSchema,
      responses: {
        200: userSchema,
      },
    },
    me: {
      method: "GET",
      path: "/api/users/me/:firebaseUid",
      responses: {
        200: userSchema,
      },
    },
    update: {
      method: "PATCH",
      path: "/api/users/:firebaseUid",
      input: z.object({
        displayName: z.string().optional(),
        profilePicture: z.string().optional(),
      }),
      responses: {
        200: userSchema,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/users/:firebaseUid',
      responses: {
        204: z.void(),
      },
    }
  },
  games: {
    list: {
      method: "GET",
      path: "/api/games",
      responses: {
        200: z.array(gameSchema),
      },
    },
    search: {
      method: "GET",
      path: "/api/games/search",
      responses: {
        200: z.array(gameSchema),
      },
    },
    get: {
      method: "GET",
      path: "/api/games/:id",
      responses: {
        200: gameSchema,
      },
    },
    characters: {
      method: "GET",
      path: "/api/games/:id/characters",
      responses: {
        200: z.array(characterSchema),
      },
    },
    achievements: {
      method: "GET",
      path: "/api/games/:id/achievements",
      responses: {
        200: z.array(achievementSchema),
      },
    },
  },
  episodes: {
    list: {
      method: "GET",
      path: "/api/games/:gameId/episodes",
      responses: {
        200: z.array(episodeSchema),
      },
    },
    get: {
      method: "GET",
      path: "/api/episodes/:id",
      responses: {
        200: episodeSchema,
      },
    },
  },
  progress: {
    get: {
      method: "GET",
      path: "/api/progress/:userId/:episodeId",
      responses: {
        200: progressSchema.optional(),
      },
    },
    recent: {
      method: "GET",
      path: "/api/progress/recent/:userId",
      responses: {
        200: z.array(z.any()),
      },
    },
    list: {
      method: "GET",
      path: "/api/progress/user/:userId",
      responses: {
        200: z.array(progressSchema),
      },
    },
    update: {
      method: "POST",
      path: "/api/progress",
      input: updateProgressRequestSchema,
      responses: {
        200: progressSchema,
      },
    },
  },
  achievements: {
    user: {
      method: "GET",
      path: "/api/achievements/user/:userId",
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  settings: {
    get: {
      method: "GET",
      path: "/api/settings/:userId",
      responses: {
        200: settingsSchema,
      },
    },
    update: {
      method: "PUT",
      path: "/api/settings/:userId",
      input: updateSettingsRequestSchema,
      responses: {
        200: settingsSchema,
      },
    },
  },
} as const;

// --- Helper for building URLs with params ---
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
