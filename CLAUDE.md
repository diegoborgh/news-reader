# Project: Meridian

## What this is

A web-based news reader with a customizable left sidebar and a main content
area organized as a stacked feed of sections (Latest + category rails), each
rendered as a masonry-style grid of varied-size cards that begins with a large
hero box. Clicking any card opens an in-app article detail view. Built for
readers who want a structured, considered alternative to algorithmic feeds —
categorization is editorial, not personalized.

Navigation in the sidebar is organized around **regions** (countries). The user
adds regions from a Topbar input and switches between them by clicking sidebar
entries. The default region is the United States.

A secondary sidebar entry, **Bookmarks**, surfaces articles the reader has
saved to `localStorage`.

## Current status (v2)

- **Regions replaced rails.** The old Nation / Foreign / Local model is gone.
  The sidebar now shows a user-managed list of countries, seeded with `US`.
  Home (`/`) renders the US feed; `/region/<ISO-2>` renders any other country.
- **Category vocabulary.** `lib/currents.ts` lists the 17 category slugs the
  app uses (including `food`). The home page surfaces seven sections in this
  fixed order: Latest News, General, Technology, Business, Entertainment,
  Food, Sports. Slug mapping lives in `lib/sections.ts`.
- **Manual refresh in the Topbar.** Page-1 section fetches are cached per
  edition slot; the Topbar refresh button calls `revalidateTag("edition")`
  + `router.refresh()` to pull fresh content on demand.
- **Sidebar is customizable.** The sidebar width is drag-resizable and can be
  collapsed to an icons-only rail. Both states persist to `localStorage`.

## Stack (non-negotiable)

- Next.js 15 with App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS v4 with a custom theme (design tokens defined below, not Tailwind defaults)
- Fonts loaded via `next/font/google` (Playfair Display + DM Sans)
- Data fetching in server components using `fetch` with Next.js caching; no TanStack Query, SWR, or Axios
- State: `useState` and `useContext` only; no Zustand, Redux, or similar
- Persistence for saved items, regions list, last region, and sidebar width/collapsed state: `localStorage`, not a database
- Icons: Lucide React, sparingly
- Deployment target: Vercel

## Currents API integration

- V2 endpoints are canonical: `https://api.currentsapi.services/v2/latest-news` and `https://api.currentsapi.services/v2/search`
- Authenticate via `Authorization` header with the API key
- Free tier is 1,000 requests/day — caching is essential
- API key lives in `.env.local` as `CURRENTS_API_KEY`, accessed only in server-side code, never exposed to the client
- All API calls go through the typed wrapper at `lib/currents.ts` — components call the wrapper, never the API directly
- API responses include `id`, `title`, `description`, `url`, `author`, `image`, `language`, `category`, `published`. **No full article body text** — the in-app article view shows the description + a prominent "Continue reading at source" link.

### Section → category mapping

`lib/sections.ts` is the single source of truth.

- **Latest News** → no category filter
- **General** → `general`
- **Technology** → `science_technology`
- **Business** → `economy_business_finance`
- **Entertainment** → `arts_culture_entertainment`
- **Food** → `food`
- **Sports** → `sport`

Every section call passes `country` when the user is viewing a non-default
region. Page 1 is cached; later pages are loaded on demand via the
`loadMoreArticles` server action and are not cached.

### Category slugs in use

`general`, `society`, `science_technology`, `politics_government`, `economy_business_finance`, `arts_culture_entertainment`, `lifestyle_leisure`, `human_interest`, `sport`, `crime_law_justice`, `education`, `environment`, `labour`, `health`, `automotive`, `real_estate`, `food`

## Caching (editions kept as cache-key only)

Page-1 section articles are wrapped in `unstable_cache` keyed on
`(sectionKey, country, editionSlot, isoDate)`. `getCurrentEdition()` in
`lib/editions.ts` produces a `morning` or `evening` slot that rotates at ~7am /
~6pm local — when the slot or date flips, the cache key changes and a fresh
fetch runs. A 12-hour `revalidate` is a safety net. The `edition` tag enables
`revalidateTag("edition")` from the Topbar refresh button (and from a future
cron trigger if we want exact-minute refresh).

Infinite-scroll pages (page ≥ 2) are fetched per-request without
`unstable_cache` — they're loaded on demand, so caching every page would waste
budget for little return.

## Design system

### Color tokens (light mode only in v2)

Names chosen to keep Tailwind v4 utility classes readable (`bg-sidebar`, `text-fg`, `border-rule` etc.):

- `--color-bg`: `#FAFAF8` (page + topbar background)
- `--color-sidebar`: `#F4F3F0` (sidebar and pill backgrounds)
- `--color-card`: `#FFFFFF` (cards)
- `--color-fg`: `#111111` (primary text)
- `--color-muted`: `#888888` (secondary text)
- `--color-rule`: `#E5E4E0` (all hairline dividers and card borders)
- `--color-accent`: `#C0392B` (wordmark, active sidebar item, category tags, CTAs)

Dark mode is deferred. When we add it, we design the dark palette deliberately — we don't auto-invert.

### Typography

- Headlines, article titles, wordmark: **Playfair Display** (Google Fonts), weights 400, 600, 700
- UI, body, metadata: **DM Sans** (Google Fonts), weights 400, 500

### Layout

- Resizable sidebar: default 220 px, min 160 px, max 400 px. Collapsed = 56 px (icons-only). Width + collapsed state persist in `localStorage` under `meridian_sidebar_width` / `meridian_sidebar_collapsed`.
- Main content uses a 4-column masonry grid on `lg+`, 2 columns on `sm`, 1 column on mobile. Row height is 260 px; the hero spans 2 cols × 2 rows, with `wide` (2×1) and `tall` (1×2) variants interspersed.
- Article view inner max-width `680 px`, padding `48px 32px 80px`.
- Touch targets at least 44×44 px.
- **Topbar date label:** below 720 px shows compact format ("Wed, Apr 22"); at 720 px and above shows full format ("Wednesday, April 22"). Both use `lining-nums` to keep Playfair Display numerals cap-height consistent. Topbar right controls (search, region, refresh) are grouped under `ml-auto` — all free space goes into the left margin so the controls never overflow the right edge. Search input is `w-[150px]` below `sm` (640 px) and `w-[180px]` above.
- **Mobile (`<md`):** the sidebar hides entirely and a horizontally-scrolling pill nav appears at the top of the main content area. Pills show one per saved region plus a `+` pill that reveals the region input. Bookmarks is a trailing icon pill.

## Non-negotiable design constraints

- **No category colors.** Category differentiation comes from small uppercase labels in accent red, plus typographic position — never chroma across categories.
- **No notifications, social sharing, engagement metrics, or algorithmic personalization.**
- **No onboarding flow.** The default region (`US`) is pre-seeded; readers land on the home feed immediately.
- **Settings surface is intentionally minimal.** The only user-facing customization is (a) the sidebar resize / collapse state, (b) the region input, and (c) the Bookmarks list. Everything else is editorial.
- **Infinite scroll is the feed model.** Sections grow as the user scrolls. Each section still has a soft ending when the API runs out — we show a quiet "Loading…" indicator, not a spinner with empty states.

## Code quality standards

- TypeScript strict mode. No `any` without explicit justification in a comment.
- Components stay small and focused. A component over 150 lines usually needs splitting.
- No premature abstraction. Don't create a utility or hook until the same code appears three times.
- Comments explain *why*, not *what*.
- Handle empty states, missing images, and API errors gracefully. A missing image should not break layout. An API failure shows a quiet error state, not a stack trace.

## How to collaborate

When I ask you to build something, respond in this order:

1. **A brief plan** (3–6 sentences) describing what you're about to build, assumptions you're making, and any decisions you think need my input before you write code. If you see a problem with my request or disagree with it, raise it here rather than silently solving it differently.

2. **The code**, with each file clearly labeled. Write code that's ready to run — no placeholder comments unless we've explicitly agreed to defer something.

3. **A short verification note** (2–4 sentences) on how to test what you've built and what to build next. Don't summarize the code — I can read it.

Be direct. If I suggest something that conflicts with the constraints above, say so. If you're uncertain about something, ask rather than assume.
