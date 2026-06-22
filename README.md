# lenga-rn

Expo / React Native learner mobile app for the Lenga e-learning platform. Learners use it to access lessons, quizzes, and matching exercises — and the app writes analytics events back to the API.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo ~54 / React Native 0.81 |
| Language | TypeScript |
| Navigation | expo-router (file-based) |
| Global state | Redux Toolkit + Redux Persist |
| Server state | TanStack React Query v5 |
| HTTP | Axios |
| Offline DB | expo-sqlite + Drizzle ORM |
| Forms | React Hook Form + Yup |
| i18n | i18next + react-i18next (Kinyarwanda) |
| Fonts | Plus Jakarta Sans (`@expo-google-fonts`) |
| Package manager | pnpm |

---

## Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Expo CLI (`pnpm add -g expo-cli`) or `npx expo`
- Android Studio (Android) or Xcode (iOS) for native builds
- Expo Go for quick device testing

---

## Environment

Create `.env.local` in the project root:

```bash
EXPO_PUBLIC_API_URL=http://localhost:1337
```

The default fallback (in `utils/functions/env.ts`) is `https://api.lenga.site` (production).

---

## Development

```bash
pnpm install
pnpm start            # Start Metro bundler
pnpm android          # Run on Android emulator / device
pnpm ios              # Run on iOS simulator / device
pnpm db:generate      # Regenerate Drizzle migrations after schema changes
```

---

## Architecture

### File-based routing (`app/`)

expo-router maps files to screens. The root layout (`app/_layout.tsx`) wraps everything in `AppProviders` and creates a Stack navigator.

| Route | Screen |
|-------|--------|
| `app/index.tsx` | Entry redirect |
| `app/splash.tsx` | Splash screen |
| `app/login.tsx` | Login |
| `app/register.tsx` | Registration |
| `app/terms.tsx` | Terms & conditions |
| `app/onboarding/profile.tsx` | Extended-profile onboarding |
| `app/lessons/index.tsx` | Lesson list |
| `app/lessons/[lessonId].tsx` | Lesson detail / chapter list |
| `app/lessons/chapters/[chapterId]/video.tsx` | Video chapter |
| `app/lessons/chapters/[chapterId]/quiz.tsx` | Quiz chapter |
| `app/lessons/chapters/[chapterId]/matching.tsx` | Matching chapter |

### State management

| Store | Slice | Contents |
|-------|-------|----------|
| Redux (persisted) | `authSlice` | JWT token, user profile |
| Redux (persisted) | `preferencesSlice` | App settings |
| Redux | `offlineMediaSlice` | Download queue state |
| Redux | `offlineAssetsSlice` | Downloaded asset registry |
| Redux | `offlineContentSlice` | Cached content IDs |

TanStack React Query handles server state (content fetching); Redux handles client state (auth, offline).

### Offline sync

- `expo-sqlite` + Drizzle ORM stores a local cache (`db/schema.ts`): `sync_state`, `strapi_entities`, `local_assets`, download queue.
- `downloads/` — resumable file downloads for lesson media (video, audio).
- The offline content slice tracks which lessons are fully available locally.

### Analytics event writes

The app writes three types of events to the API:

| Event | API endpoint | When |
|-------|-------------|------|
| Create / update extended profile | `POST/PATCH /api/extended-profiles` | After onboarding |
| Lesson started | `POST /api/module-attendances` | On lesson open |
| Lesson completed | `PATCH /api/module-attendances/:id` | When all chapters done |
| Assessment submitted | `POST /api/assessment-submissions` | On quiz/matching finish |

Key files:

- `services/analytics.service.ts` — Axios calls to accumulation endpoints
- `hooks/useAnalytics.ts` — React Query mutations + tracking helpers
- `utils/analytics/trackAnalytics.ts` — Fire-and-forget wrapper
- `utils/analytics/chapterProgress.ts` — Local chapter progress → lesson completion logic

### i18n

Primary language is Kinyarwanda (`rw`). Translation files live in `translations/modules/rw/`:

- `global.json` — shared UI strings
- `lessons.json` — lesson-related strings
- `profile.json` — profile / onboarding strings

### HTTP client

`utils/api/index.ts` — Axios instance with:
- Base URL from `EXPO_PUBLIC_API_URL`
- JWT injected from the Redux `authSlice`

---

## Project structure

```
lenga-rn/
├── app/                     # expo-router file-based screens
├── assets/                  # Images, logos
├── components/
│   ├── buttons/
│   ├── cards/
│   ├── modals/
│   ├── providers/AppProviders.tsx
│   └── typography/
├── constants/theme.ts
├── db/schema.ts             # Drizzle SQLite schema
├── downloads/               # Resumable download logic
├── drizzle/                 # Drizzle migration files
├── hooks/
│   └── useAnalytics.ts      # React Query hooks for analytics events
├── screens/                 # Screen components (auth, lessons, onboarding)
├── services/
│   ├── analytics.service.ts
│   ├── auth.service.ts
│   ├── lessons.service.ts
│   ├── users.service.ts
│   └── rwandaLocation.service.ts
├── store/
│   ├── index.ts             # Redux store + persist config
│   └── slices/              # authSlice, preferencesSlice, offlineSlices
├── translations/
│   ├── i18n.ts
│   └── modules/rw/
├── types/
│   ├── analytics.ts
│   └── api.ts
└── utils/
    ├── api/index.ts         # Axios instance
    ├── analytics/
    └── functions/env.ts     # EXPO_PUBLIC_API_URL
```

---

## Build & distribution

Builds are managed via EAS (Expo Application Services).

```bash
eas build --profile preview --platform android   # Internal test build
eas build --profile production --platform all    # Production APK / IPA
eas update                                        # Push OTA update (JS only)
```

Build profiles are defined in `eas.json`: `preview`, `preview2`–`preview4`, `production`.

The EAS project ID is set in `app.json` under `expo.extra.eas.projectId`.

---

## Drizzle migrations

After changing `db/schema.ts`:

```bash
pnpm db:generate
```

This regenerates migration files in `drizzle/`. The app applies them automatically on startup via the SQLite provider in `AppProviders.tsx`.
