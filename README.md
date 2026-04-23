# Meridian News Reader

A web-based news reader designed as a calm alternative to algorithmic feeds. See [CLAUDE.md](CLAUDE.md) for the product brief and constraints.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Fraunces + IBM Plex Sans via `next/font/google`.

## Setup

```bash
npm install
cp .env.local.example .env.local  # then paste your Currents API key
npm run dev
```

Open http://localhost:3000.

## Layout

```
app/         routes (App Router)
components/  shared UI
lib/         server-side utilities (Currents client, editioning)
```

## Design tokens

Colors, typography, and spacing are defined as CSS variables in [app/globals.css](app/globals.css) and exposed to Tailwind via `@theme inline`. Dark mode is driven by `prefers-color-scheme` — no toggle.

## Commands

| | |
|---|---|
| `npm run dev`   | start the dev server |
| `npm run build` | production build |
| `npm run start` | run the built app |
| `npm run lint`  | eslint |
