# GamLo Studios - Interactive Video Game Platform

## Overview

GamLo Studios is an interactive video streaming platform that delivers choice-driven, branching narrative games. Users watch video content and make decisions at key moments that alter the story's direction. The platform features a dark, cinematic UI aesthetic, user authentication via Firebase, progress tracking across episodes, and a freemium content model with paid episode unlocks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for cinematic transitions and UI effects
- **Video Playback**: react-player for handling video content
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared route contracts (`shared/routes.ts`)
- **Validation**: Zod schemas for request/response validation, shared between client and server

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**:
  - `users` - Firebase-linked user accounts
  - `games` - Top-level game/series entries
  - `episodes` - Individual playable episodes with JSONB structure for branching video nodes
  - `userProgress` - Tracks current position and choices in episodes
  - `userSettings` - User preferences (volume, subtitles, accessibility)
- **Migrations**: Drizzle Kit with `db:push` command for schema sync

### Authentication
- **Provider**: Firebase Authentication (Google OAuth)
- **Flow**: Client-side Firebase auth → sync user to PostgreSQL via `/api/users/sync` endpoint
- **Session**: Firebase handles tokens client-side; backend validates via Firebase UID

### Interactive Video Structure
Episodes contain a JSONB `structure` field with:
- `startNodeId`: Entry point for the episode
- `nodes`: Map of video segments, each with `videoUrl` and optional `choices` array
- Choices define `text`, `nextNodeId`, and optional `time` for when choice appears

### API Contract Pattern
Routes are defined in `shared/routes.ts` with Zod schemas for inputs and outputs. Both client and server import from this shared location ensuring type safety across the stack.

## External Dependencies

### Third-Party Services
- **Firebase**: Authentication (Google OAuth provider)
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Async state management
- `firebase`: Client-side authentication SDK
- `react-player`: Video playback handling
- `framer-motion`: Animation library
- `zod`: Schema validation
- `shadcn/ui` components: Pre-built accessible UI components

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID