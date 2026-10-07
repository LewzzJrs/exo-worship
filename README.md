# Exo Worship Library

A private web app for the **Exo Worship** praise & worship team: a shared library of chord sheets with transposition, team and personal setlists, combined PDF exports, and an admin panel for managing content.

The app is built for a team of about 50 members. Members sign in with a single team access code, with no personal accounts. Only admins create and edit content. The user interface is in Indonesian.

## Features

### For members

- **Song library** with search, monthly recommended songs, and likes
- **Chord sheet viewer** with instant transposition, adjustable font size, auto-scroll, and screen wake lock for use on stage
- **YouTube player** embedded on each song page
- **My Library**: bookmark songs on your own device
- **Setlists**
  - Team setlists made by admins, which can include setlist-specific arrangements
  - Personal setlists stored on your device
  - Per-song key and notes, plus sharing via WhatsApp
- **PDF export** for a single song or a whole setlist, with a live preview and a choice of font and font size
- **Song requests** sent to the admins, with status tracking
- **Installable PWA** that keeps opened pages and saved setlists readable offline

### For admins

- Password-protected panel. Each admin picks their profile and photo after signing in.
- **Song editor**: chords-over-words format, autosaved drafts, and a warning about unsaved changes before leaving the page
- **Import** lyrics and chords from Word, PowerPoint, PDF, Google Docs, and Google Slides
- **Team setlist editor** with custom arrangements that don't change the library version of a song
- **Monthly recommendations**, managed by a designated admin
- **Request inbox**, **activity log**, and per-item **edit history** showing who created or changed what, and when
- Change the team access code. All member devices then have to sign in again.
- A separate **Exo Admin** app that can be installed on the home screen

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Route Handlers) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com) (Radix UI)
- [Supabase](https://supabase.com) for Postgres and Storage, accessed only from the server with a secret key
- [ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS) for parsing and transposing chords
- [@react-pdf/renderer](https://react-pdf.org) to generate PDFs and [unpdf](https://github.com/unjs/unpdf) to preview and import them
- [Zustand](https://zustand.docs.pmnd.rs), React Hook Form, and Zod
- A service worker for offline support, deployed on [Vercel](https://vercel.com)

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- A Supabase project

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

Open the **SQL Editor** in your Supabase project and run [`supabase/schema.sql`](supabase/schema.sql). It creates all tables and turns on row level security. The app connects with the secret key, so it doesn't need any RLS policies. The `avatars` storage bucket is created automatically the first time an admin uploads a profile photo.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable              | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| `TEAM_ACCESS_CODE`    | Initial team access code for members (case-insensitive)                |
| `SESSION_SECRET`      | Long random string used to sign access cookies                         |
| `SUPABASE_URL`        | Supabase project URL                                                   |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server-only, never prefix with `NEXT_PUBLIC_`)    |
| `ADMIN_PASSWORD`      | Password for the admin panel at `/admin`                               |
| `ADMIN_WHATSAPP`      | Optional admin WhatsApp number for the help page, e.g. `6281234567890` |

To generate a `SESSION_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Admin profile names are defined in [`src/lib/constants.ts`](src/lib/constants.ts).

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the team access code. The admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm run dev`    | Start the development server  |
| `npm run build`  | Create a production build     |
| `npm run start`  | Run the production build      |
| `npm run lint`   | Run ESLint                    |
| `npm run format` | Format the code with Prettier |

## Project structure

```
src/
  app/            Routes: (auth) sign-in, (main) member pages, admin panel, API routes
  components/     UI components grouped by feature (song, setlist, admin, pdf, shared, ui)
  hooks/          Client hooks (drafts, leave confirmation, wake lock, auto-scroll)
  lib/            Data access, auth, chord parsing, importers, and server actions
  store/          Zustand stores for on-device data (library, setlists, preferences)
  fonts/          Monospace fonts embedded in the PDFs
  proxy.ts        Protects member and admin routes
public/sw.js      Service worker for offline support
supabase/         Database schema
```

## Deployment

The app runs on Vercel. Import the repository, add the same environment variables in the project settings, and deploy. The PDF fonts in `src/fonts` are bundled with the `/api/pdf` route through `outputFileTracingIncludes` in [`next.config.ts`](next.config.ts).

## License

© Lewi Maropo. All rights reserved.

The source code is shared for viewing only. Song lyrics and chords are stored in the database, not in this repository. The JetBrains Mono and IBM Plex Mono fonts in [`src/fonts`](src/fonts) are licensed under the SIL Open Font License 1.1, and their license files are included.
