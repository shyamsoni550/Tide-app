# Tide Tracker

React application for modeled tide levels, waves, weather, and coastal activity guidance. Tide and wave data come from the free Open-Meteo Marine API. User accounts and saved locations use Supabase.

## Features

- Email/password login and signup
- Persistent Supabase sessions
- Per-user saved locations protected by Row Level Security
- Open-Meteo modeled high and low tide detection
- Current sea level, wave height, wave period, and swell height
- Weather and wind-based activity recommendations
- Dark mode and local location persistence

## Local Setup

Install dependencies:

```bash
npm install
```

Create a Supabase project at [database.new](https://database.new), then open its SQL Editor and run:

```text
supabase/schema.sql
```

Copy `.env.example` to `.env` and fill in the values from Supabase's **Project Settings > API** page:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is designed for browser use. Legacy projects can instead use `VITE_SUPABASE_ANON_KEY`. Never put a Supabase secret or `service_role` key in a Vite environment variable.

Start the app:

```bash
npm run dev
```

Without Supabase environment variables, the app offers guest mode. Login, signup, and cloud-saved locations become active after Supabase is configured.

## Authentication

Supabase email confirmation is enabled by default on many new projects. After signup, users may need to click the confirmation link before logging in.

For production, add your deployed URL under **Authentication > URL Configuration** in Supabase and configure a custom SMTP provider before sending significant email volume.

## Tide Data

`src/api/tideapi.js` calls:

```text
https://marine-api.open-meteo.com/v1/marine
```

The app requests `sea_level_height_msl` and detects local maxima and minima to produce the existing `High` and `Low` tide display.

Open-Meteo states that this modeled sea-level value includes tides but is referenced to global mean sea level. Coastal accuracy is limited, and the data must not be used for navigation or as a replacement for an official nautical almanac.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```
