# TaskFlow

A production-style **task & project manager** that exercises the full frontend
stack: authentication, filesystem routing, REST **and** GraphQL data fetching,
client/server state separation, a themeable responsive UI, and tests at every
layer (unit, integration, E2E).

Built on three published packages:

| Package | Role |
| --- | --- |
| [`@jasonruesch/react`](https://www.npmjs.com/package/@jasonruesch/react) | Accessible, themeable design system (Radix + Tailwind v4 + CVA) |
| [`@jasonruesch/tokens`](https://www.npmjs.com/package/@jasonruesch/tokens) | Design tokens (consumed via the react preset) |
| [`@evolonix/react-router-next`](https://www.npmjs.com/package/@evolonix/react-router-next) | Next.js-style filesystem routing for React Router |

## Stack

- **React 19 + TypeScript (strict)** on **Vite**
- **Routing** — `@evolonix/react-router-next` (filesystem routes in `src/app/`)
- **UI** — `@jasonruesch/react` via the bring-your-own-Tailwind preset, plus `lucide-react` icons
- **Server state** — REST (auth, projects) through **TanStack Query**; GraphQL (tasks, comments) through **Apollo Client** — both with suspense
- **Client state** — **Zustand** (session, theme/brand, board filters), persisted where it matters
- **Mock backend** — **MSW** serving both REST endpoints and a GraphQL schema over one shared in-memory DB
- **Validation** — **Zod** (typed/validated route search params, forms)
- **Testing** — **Vitest** + Testing Library + **vitest-axe** (unit/integration), **Playwright** (E2E)

## Getting started

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

There is **no real backend** — MSW boots automatically and serves seeded,
deterministic data. Sign in with the demo account (prefilled via the
**“Use demo account”** button):

```
avery@taskflow.app  /  password
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Vite dev server (MSW enabled) |
| `pnpm build` | Typegen → `tsc -b` → production build |
| `pnpm preview` | Serve the production build (MSW enabled) |
| `pnpm typecheck` | Router typegen + `tsc` |
| `pnpm lint` | ESLint (flat config) |
| `pnpm test` | Vitest unit + integration (incl. accessibility) |
| `pnpm test:e2e` | Playwright end-to-end (auto-builds + previews) |

## Architecture

```
src/
├─ app/                       # filesystem routes (@evolonix/react-router-next)
│  ├─ layout.tsx              # providers: Apollo, TanStack Query, Tooltip, theme
│  ├─ (auth)/login/           # public login (Zod searchSchema)
│  └─ (app)/                  # auth-guarded area + app shell
│     ├─ dashboard/           # parallel @analytics slot
│     ├─ projects/            # REST list + create
│     │  └─ [projectId]/      # board (GraphQL), settings, @modal slot
│     │     ├─ [taskId]/      # full-page task detail
│     │     └─ @modal/(.)[taskId]/  # intercepting-route modal overlay
│     └─ settings/
├─ components/                # cross-cutting UI (app shell, links, feedback…)
├─ lib/                       # api-client (REST), apollo, query-client, formatting
├─ stores/                    # Zustand: session, theme, board UI
├─ mocks/                     # MSW: shared DB + REST + GraphQL handlers
└─ types/                     # shared domain models
```

### Router conventions exercised

Route groups `(auth)`/`(app)`, nested layouts, dynamic `[id]`, **parallel routes**
(`@analytics`), **intercepting routes** (`@modal/(.)[taskId]` — open a task as a
modal over the board on click; deep-link/refresh renders the full page), typed
`params` + Zod-validated `searchParams`, `generate()` URL builders, and
multi-depth `loading.tsx` / `error.tsx` / `not-found.tsx` boundaries.

### REST vs GraphQL

Both transports are mocked by MSW against one `db`, so data stays consistent:

- **REST + TanStack Query** — `auth`, `projects`, `members`, `stats`
- **GraphQL + Apollo** — `tasks`, `comments` (optimistic board moves, comment threads)

Both use suspense, so the router's `loading.tsx` boundaries and `notFound()`
integrate automatically.

## Theming

Light/dark + multi-brand via `data-theme` / `data-brand` on `<html>`, driven by a
persisted Zustand store and applied before first paint (no flash). Toggle from the
top bar or the Settings page.
