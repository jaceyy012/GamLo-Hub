import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique().notNull(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  profilePicture: text("profile_picture"),
  age: integer("age"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  backgroundUrl: text("background_url").notNull(),
  lore: text("lore"), // Global game lore
  releaseDate: timestamp("release_date").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  seasonNumber: integer("season_number").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  isFree: boolean("is_free").default(false).notNull(),
  price: integer("price").default(0), // in cents
  releaseDate: timestamp("release_date").defaultNow(),
  structure: jsonb("structure").notNull(), 
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  episodeId: integer("episode_id").notNull(),
  gameId: integer("game_id").notNull(), // Added for easier aggregation
  currentNodeId: text("current_node_id"),
  completed: boolean("completed").default(false),
  choices: jsonb("choices").default([]), // Array of choices made
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  masterVolume: integer("master_volume").default(10),
  musicVolume: integer("music_volume").default(10),
  muteAll: boolean("mute_all").default(false),
  subtitles: boolean("subtitles").default(true),
  subtitleSize: text("subtitle_size").default("medium"), // small, medium, large
  subtitleLanguage: text("subtitle_language").default("English"),
  autoPlayNext: boolean("auto_play_next").default(true),
  releaseDateCountdown: boolean("release_date_countdown").default(true),
  recaps: boolean("recaps").default(true),
  choiceRecaps: boolean("choice_recaps").default(true),
});

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true, releaseDate: true });
export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });
export const insertEpisodeSchema = createInsertSchema(episodes).omit({ id: true, releaseDate: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertProgressSchema = createInsertSchema(userProgress).omit({ id: true, updatedAt: true });
export const insertSettingsSchema = createInsertSchema(userSettings).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Episode = typeof episodes.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;

export interface VideoNode {
  videoUrl: string;
  choices?: Array<{
    id: string;
    text: string;
    nextNodeId: string;
    type?: 'default' | 'qte' | 'timed';
    duration?: number;
  }>;
  subtitles?: Array<{
    startTime: number;
    endTime: number;
    text: string;
  }>;
}

export interface EpisodeStructure {
  startNodeId: string;
  nodes: Record<string, VideoNode>;
}
