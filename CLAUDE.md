# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Expo development server with telemetry disabled
- `npm run build:web` - Build for web platform using Expo export
- `npm run lint` - Run Expo linting

## Architecture Overview

Shelly is a React Native app built with Expo Router that provides AI-powered stroke recovery support. The app features Shelly, an encouraging turtle companion that uses ElevenLabs conversational AI to provide personalized guidance, exercises, and emotional support for stroke recovery patients.

### Core Structure
- **Expo Router**: File-based routing with `app/` directory structure
- **Authentication**: Supabase-based auth with `AuthContext` and `UserContext` providers
- **Navigation**: Two main route groups - `(auth)` for login flows and `(tabs)` for main app
- **Styling**: NativeWind (Tailwind CSS for React Native) with custom turtle-themed colors
- **State Management**: React Context + Zustand for more complex state
- **Database**: Supabase with migrations in `supabase/migrations/`

### Key Components
- `TurtleStartupScreen` - App startup animation/loading
- `TurtleIntroduction` - User onboarding with Shelly the turtle companion
- `TurtleCompanion` - Main Shelly character component with animations and moods
- `TurtleConversationAI` - ElevenLabs integration for AI conversations with Shelly

### Authentication Flow
1. Root layout wraps app in `AuthProvider` and `UserProvider`
2. Auth state determines routing between `(auth)` and `(tabs)` groups
3. Shelly introduction shows on successful sign-in via `showTurtleIntro` flag
4. Supabase handles authentication with environment variables

### Styling System
- Custom Tailwind theme with turtle-specific colors (turtle-teal, turtle-amber, etc.)
- Inter font family with regular, semibold, and bold weights
- NativeWind for consistent styling across platforms

### Main App Sections (Tabs)
- **Home** (`index.tsx`) - Dashboard/main screen
- **Exercises** - Stroke recovery exercises
- **Learn** - Educational content
- **Progress** - User progress tracking
- **Profile** - User profile and settings

### AI Integration
- **ElevenLabs Conversational AI**: Powers Shelly's voice conversations
- **Client Tools**: Allow Shelly to suggest exercises and learning modules with actionable buttons
- **Contextual Intelligence**: Personalized responses based on patient data and progress

### Environment Setup
Requires these environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ELEVENLABS_AGENT_ID`
- `EXPO_PUBLIC_ELEVENLABS_API_KEY`