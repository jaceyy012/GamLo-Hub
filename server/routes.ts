import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { InsertEpisode, InsertGame } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Users ===
  app.post(api.users.sync.path, async (req, res) => {
    try {
      const input = api.users.sync.input.parse(req.body);
      let user = await storage.getUserByFirebaseUid(input.firebaseUid);
      
      if (!user) {
        user = await storage.createUser(input);
        await storage.createSettings({ userId: user.id });
        res.status(201).json(user);
      } else {
        user = await storage.updateUser(input.firebaseUid, input);
        res.status(200).json(user);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.users.update.path, async (req, res) => {
    const user = await storage.updateUser(req.params.firebaseUid, req.body);
    res.json(user);
  });

  app.get(api.users.me.path, async (req, res) => {
    const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.delete(api.users.delete.path, async (req, res) => {
    await storage.deleteUser(req.params.firebaseUid);
    res.status(204).send();
  });

  // === Games ===
  app.get(api.games.list.path, async (req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.get(api.games.search.path, async (req, res) => {
    const query = req.query.q as string;
    const games = await storage.searchGames(query || "");
    res.json(games);
  });

  app.get(api.games.get.path, async (req, res) => {
    const game = await storage.getGame(Number(req.params.id));
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game);
  });

  app.get(api.games.characters.path, async (req, res) => {
    const chars = await storage.getCharacters(Number(req.params.id));
    res.json(chars);
  });

  app.get(api.games.achievements.path, async (req, res) => {
    const achs = await storage.getAchievements(Number(req.params.id));
    res.json(achs);
  });

  // === Episodes ===
  app.get(api.episodes.list.path, async (req, res) => {
    const episodes = await storage.getEpisodes(Number(req.params.gameId));
    res.json(episodes);
  });

  app.get(api.episodes.get.path, async (req, res) => {
    const episode = await storage.getEpisode(Number(req.params.id));
    if (!episode) return res.status(404).json({ message: "Episode not found" });
    res.json(episode);
  });

  // === Progress ===
  app.get(api.progress.get.path, async (req, res) => {
    const progress = await storage.getProgress(Number(req.params.userId), Number(req.params.episodeId));
    res.json(progress);
  });

  app.get(api.progress.recent.path, async (req, res) => {
    const progress = await storage.getRecentProgress(Number(req.params.userId), 5);
    res.json(progress);
  });

  app.get(api.progress.list.path, async (req, res) => {
    const list = await storage.getUserProgressList(Number(req.params.userId));
    res.json(list);
  });

  app.post(api.progress.update.path, async (req, res) => {
    try {
      const input = api.progress.update.input.parse(req.body);
      let progress = await storage.getProgress(input.userId, input.episodeId);
      if (progress) {
        progress = await storage.updateProgress(input.userId, input.episodeId, input);
      } else {
        progress = await storage.createProgress(input);
      }
      res.json(progress);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === Achievements ===
  app.get(api.achievements.user.path, async (req, res) => {
    const achs = await storage.getUserAchievements(Number(req.params.userId));
    res.json(achs);
  });

  // === Settings ===
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings(Number(req.params.userId));
    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const input = api.settings.update.input.parse(req.body);
    const settings = await storage.updateSettings(Number(req.params.userId), input);
    res.json(settings);
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const gamesList = await storage.getGames();
  if (gamesList.length === 0) {
    const game = await storage.createGame({
      title: "Shadow over Replit",
      description: "A dark mystery unfolding in a virtual space.",
      thumbnailUrl: "https://placehold.co/800x450/1a1a1a/ffffff?text=Shadow+over+Replit",
      backgroundUrl: "https://placehold.co/1920x1080/1a1a1a/ffffff?text=Shadow+over+Replit+BG",
      lore: "The digital world is collapsing, and you are the only one who can stop it."
    });

    await storage.createEpisode({
      gameId: game.id,
      title: "The Beginning",
      description: "The first step into the darkness.",
      seasonNumber: 1,
      episodeNumber: 1,
      isFree: true,
      price: 0,
      structure: {
        startNodeId: "node1",
        nodes: {
          node1: {
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            choices: [
              { id: "c1", text: "Investigate the glitch", nextNodeId: "node1" },
              { id: "c2", text: "Ignore the warning", nextNodeId: "node1" }
            ],
            subtitles: [{ startTime: 0, endTime: 5, text: "Systems offline. Emergency protocols engaged." }]
          }
        }
      }
    });
  }
}
