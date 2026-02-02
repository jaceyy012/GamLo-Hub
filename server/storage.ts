import { db } from "./db";
import {
  users, games, episodes, userProgress, userSettings, characters, achievements, userAchievements,
  type User, type InsertUser, type UpdateUserRequest,
  type Game, type InsertGame,
  type Episode, type InsertEpisode,
  type UserProgress, type InsertProgress, type UpdateProgressRequest,
  type UserSettings, type InsertSettings, type UpdateSettingsRequest,
  type Character, type Achievement
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(firebaseUid: string, updates: UpdateUserRequest & { profilePicture?: string }): Promise<User>;
  deleteUser(firebaseUid: string): Promise<void>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  searchGames(query: string): Promise<Game[]>;

  // Characters & Lore
  getCharacters(gameId: number): Promise<Character[]>;

  // Achievements
  getAchievements(gameId: number): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<any[]>;

  // Episodes
  getEpisodes(gameId: number): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;

  // Progress
  getProgress(userId: number, episodeId: number): Promise<UserProgress | undefined>;
  getRecentProgress(userId: number, limit: number): Promise<any[]>;
  getUserProgressList(userId: number): Promise<UserProgress[]>;
  createProgress(progress: InsertProgress): Promise<UserProgress>;
  updateProgress(userId: number, episodeId: number, updates: UpdateProgressRequest): Promise<UserProgress>;

  // Settings
  getSettings(userId: number): Promise<UserSettings | undefined>;
  createSettings(settings: InsertSettings): Promise<UserSettings>;
  updateSettings(userId: number, updates: UpdateSettingsRequest): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(firebaseUid: string, updates: any): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.firebaseUid, firebaseUid)).returning();
    return user;
  }

  async deleteUser(firebaseUid: string): Promise<void> {
    await db.delete(users).where(eq(users.firebaseUid, firebaseUid));
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async searchGames(query: string): Promise<Game[]> {
    const all = await db.select().from(games);
    return all.filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
  }

  async getCharacters(gameId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.gameId, gameId));
  }

  async getAchievements(gameId: number): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.gameId, gameId));
  }

  async getUserAchievements(userId: number): Promise<any[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async getEpisodes(gameId: number): Promise<Episode[]> {
    return await db.select().from(episodes).where(eq(episodes.gameId, gameId));
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode;
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const [episode] = await db.insert(episodes).values(insertEpisode).returning();
    return episode;
  }

  async getProgress(userId: number, episodeId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.episodeId, episodeId)));
    return progress;
  }

  async getUserProgressList(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getRecentProgress(userId: number, limit: number): Promise<any[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId)).orderBy(desc(userProgress.updatedAt)).limit(limit);
  }

  async createProgress(insertProgress: InsertProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateProgress(userId: number, episodeId: number, updates: UpdateProgressRequest): Promise<UserProgress> {
    const [progress] = await db.update(userProgress).set(updates).where(and(eq(userProgress.userId, userId), eq(userProgress.episodeId, episodeId))).returning();
    return progress;
  }

  async getSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async createSettings(insertSettings: InsertSettings): Promise<UserSettings> {
    const [settings] = await db.insert(userSettings).values(insertSettings).returning();
    return settings;
  }

  async updateSettings(userId: number, updates: UpdateSettingsRequest): Promise<UserSettings> {
    const [settings] = await db.update(userSettings).set(updates).where(eq(userSettings.userId, userId)).returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();
