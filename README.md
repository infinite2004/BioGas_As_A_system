# Biomethane Project Tracker

A fully functional frontend-only web app for biomethane plant operators to track project progress and clear bottlenecks.

## Tech Stack
- **Vite + React + TypeScript**
- **Lucide React** for icons
- **LocalStorage** for data persistence
- **CSS Modules/Plain CSS** for styling

## Features
- **Dashboard Table**: Overview of all projects and their status across stages.
- **Bottleneck Insight**: Tracks which stages are stalling the pipeline.
- **Details Drawer**: deep dive into each project with status updates, notes, and next action guidance.
- **Follow-up Generator**: Prefill email messages to stakeholders (ANP, Utilities, Lenders).
- **Onboarding Flow**: Quick tips for new users.

## Run Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Local Storage
The app uses `localStorage` to save all projects, notes, and preferences. No backend is required. Seed data is automatically loaded on the first run.
