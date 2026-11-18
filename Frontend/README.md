# SplitPay — Angular front-end

Single-page application (SPA) for the SplitPay FinTech app (students sharing a
flat: split expenses, wallet repayments, recurring bills, round-up savings).

The front-end talks to **one entry point only**: the Spring Cloud **API
Gateway**. It never calls a microservice directly.

---

## 1. Stack

| Concern            | Choice                                                              |
| ------------------ | ------------------------------------------------------------------- |
| Framework          | Angular 21 (standalone components, **no NgModules**)                 |
| Templates          | new control flow (`@if`, `@for`, `@switch`)                          |
| State              | **signals** (`signal`, `computed`, `effect`) — zoneless              |
| Routing            | `provideRouter` + lazy `loadComponent` / `loadChildren` per feature  |
| HTTP               | `provideHttpClient(withInterceptors([...]))` (functional interceptors) |
| Forms              | reactive forms (`ReactiveFormsModule`)                               |
| Styling            | SCSS, design tokens as **CSS custom properties** (light + dark)      |
| TypeScript         | `strict` + `strictTemplates`, **no `any`**                           |

> The React/Vite Figma export used Tailwind, but **no Tailwind utility class was
> actually used in the JSX** (verified), so the whole stylesheet is a pure
> CSS → SCSS port. Nothing visual changed.

---

## 2. How to run

```bash
cd Frontend
npm install
npm start          # ng serve  -> http://localhost:4200
npm run build      # ng build  (production bundle, must exit with 0 errors)
```

Node **v22.20.0** / npm 10.9.3 were used. Angular 22 requires Node ≥ v22.22.3,
which is why the project targets the latest **21.2.x** line.

### Demo login (mock mode)

While `useMockData` is `true` the sign-in form is pre-filled with
`maya@splitpay.app` / `splitpay123`. Any well-formed email plus an 8-character
password is accepted — the account is created locally by the mock layer.

---

## 3. Project structure

```
Frontend/src/
├── app/
│   ├── app.config.ts            # DI wiring: router, HttpClient + interceptors, demo clock
│   ├── app.routes.ts            # lazy routes, authGuard / guestGuard
│   ├── app.ts / app.html        # root: <router-outlet> + global toast stack
│   ├── core/
│   │   ├── api/                 # ONE service per backend microservice
│   │   ├── constants/           # gateway prefixes + storage keys (single source of truth)
│   │   ├── guards/              # authGuard, guestGuard
│   │   ├── interceptors/        # auth (Bearer + 401), error (-> toast)
│   │   ├── layout/app-shell/    # sidebar + topbar + bottom-nav + global modals
│   │   ├── services/            # auth, token storage, theme, toast, notifications, clock, ui-modal
│   │   └── utils/               # http-error -> user message
│   ├── features/
│   │   ├── auth/                # welcome / sign-in / sign-up / profile-setup
│   │   ├── dashboard/
│   │   ├── groups/              # households + group-detail
│   │   ├── expenses/            # 2-step add-expense modal
│   │   ├── settlements/         # settle-up modal + success screen
│   │   ├── wallet/ recurring/ savings/ notifications/ profile/ design-system/
│   ├── mock/                    # toggleable mock layer + fixed demo clock
│   ├── models/                  # one interface file per entity (+ barrel)
│   └── shared/
│       ├── components/          # button, input, card, avatar, avatar-stack, badge, tag,
│       │                        # switch, progress-ring, modal, tabs, page-header,
│       │                        # activity-item, date-label, skeleton, empty-state,
│       │                        # error-state, icon, toast-container
│       ├── constants/           # DEMO_PEOPLE (decorative avatar cast)
│       └── utils/               # date-format helpers ("12m", "Due in 4 days", …)
├── environments/                # environment.ts / environment.prod.ts
└── styles/                      # _variables, _base, _shell-components, _pages, _overlays
```

### Gateway prefixes

All gateway paths live in
[api-endpoints.ts](src/app/core/constants/api-endpoints.ts):

```
/api/accounts  /api/groups  /api/wallet  /api/expenses
/api/settlements  /api/recurring  /api/savings  /api/notifications
```

Renaming or moving a service behind a different gateway route means editing
that one file.

---

## 4. Switching between mock data and the real gateway

Everything is driven by a single flag:

```ts
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080', // API Gateway
  useMockData: true,               // <-- flip to false once the services are up
  mockLatencyMs: 350,
  notificationPollMs: 30000,
} as const;
```

* `useMockData: true` — every `*ApiService` returns data from `src/app/mock`
  with a simulated latency (so the skeletons are exercised). The frozen demo
  clock (`MOCK_NOW`) keeps the relative labels stable.
* `useMockData: false` — the same services perform real HTTP calls through the
  gateway. **No component code changes.**

`environment.prod.ts` is the production counterpart (same shape, `production:
true`). It is wired through `fileReplacements` in the `production`
configuration of [angular.json](angular.json), so `ng build` (the default
configuration) swaps `environment.ts` for `environment.prod.ts` — i.e. the
production bundle targets the real gateway with the mock layer off, while
`ng build --configuration development` (and `ng serve`) keep the mock layer on.

---

## 5. Authentication & error handling

* `AuthService` — `login`, `register`, `completeProfile`, `updateProfile`,
  `logout`. JWT + user are persisted by `TokenStorageService` (which has **no
  `HttpClient` dependency**, so interceptors can inject it without a DI cycle).
* `authInterceptor` — adds `Authorization: Bearer <token>` **only** for requests
  targeting `environment.apiUrl`; on `401` it clears the session and redirects
  to `/auth/sign-in?returnUrl=…` (then bounces back after sign-in).
* `errorInterceptor` — maps HTTP failures to user-readable messages via
  `toUserMessage()` and pushes them into `ToastService` (skips `401`, already
  handled).
* `authGuard` protects every shell route; `guestGuard` keeps signed-in users
  away from the auth screens.
* `NotificationService` — transport-agnostic unread-counter store. Today it
  polls `/api/notifications/badge`; switching to WebSocket/SSE later only
  changes `start()`, because components read the `unread` / `hasUnread` signals
  only.

---

## 6. Theming

All colours/radii/shadows are CSS custom properties declared in
[`_variables.scss`](src/styles/_variables.scss). `ThemeService` toggles
`data-theme="dark"` on `<html>`, which re-themes the entire app (the React
export used an `.app.dark` ancestor class instead) and persists the choice in
`localStorage`.

---

## 7. React → Angular conversion notes

| React                                     | Angular                                                        |
| ----------------------------------------- | -------------------------------------------------------------- |
| `useState<Screen>` switch                 | Angular Router (one lazy route per screen)                     |
| props / callbacks                         | `input()` / `output()` / `model()`                             |
| `useState` / `useEffect`                   | `signal()` / `computed()` / `effect()`                          |
| Context                                   | `providedIn: 'root'` injectable services                       |
| inline mock arrays in the component       | `*ApiService` (`core/api`) backed by the toggleable mock layer |
| `Icon` / `Avatar` / `Button` / `Card` / … | `shared/components/**` (same class names, same markup)          |
| `className="app dark"`                    | `:root[data-theme="dark"]` + `ThemeService`                    |
| Tailwind (`@import "tailwindcss"`)        | plain SCSS (no utility class was used)                          |
| inline `<div class="modal-backdrop">`     | `<app-modal>` component                                         |

Replaced libraries: **Tailwind CSS v4 was dropped** (unused), and no React
runtime dependency remains. Nothing was added in exchange — the routing, DI,
forms and HTTP layers are all first-party Angular.

### Host-element strategy

Components that ported a styled native element use attribute selectors and put
the design's classes on the host element, so the ~3 200 lines of ported CSS keep
matching without a rewrite:

```html
<button appButton variant="secondary" icon="send">Settle up</button>
<section appCard class="balance-card">…</section>
<span appTag tone="green">PAID</span>
```

---

## 8. Not converted automatically / assumptions

1. **`input` and `badge` are attribute primitives, not wrapper components.**
   The Figma stylesheet has no dedicated `.input` or `.badge` block — form
   fields are styled through their context (`.auth-card label > input`,
   `.input-wrap input`, `.amount-input input`) and counters through their
   context (`.sidebar nav button b`, `.tabs button b`). So both live on the
   native element itself: `<input appInput [invalid]="…">` (toggles the
   existing `.input-error` class) and `<b appBadge>3</b>`. Keeping them on the
   host element means every contextual selector — and therefore the visual
   result — stays byte-for-byte identical.
2. **Group/member id details.** The React app had a single hardcoded "Maple
   House" screen. The expenses/settlements modals now target the demo household
   `g-maple` with payer `u-maya`; wire them to the current route's group id when
   the backend is live.
3. **Cards the mock data does not model.** The dashboard house card and the
   household tiles show "N roommates/members" — `GroupSummary` has no role
   discriminator or monthly expense counter, unlike the React literals
   ("4 roommates · 8 expenses this month").
4. **Inert buttons.** Actions that had no `onClick` in the Figma export (e.g.
   "Top up wallet", "New household", "Search anything") are rendered but
   deliberately do nothing.
5. **Rounding/formatting.** Amounts are formatted with `toFixed(2)`; a shared
   `CurrencyPipe`-style formatter was not introduced because the design prints
   the `$` sign manually.
6. **API services live in `core/api/`, not one folder per feature.** The task
   sketch suggested `ExpenseApiService` etc. inside each `features/*` folder;
   they are grouped under `core/api/` instead so the gateway prefixes, the mock
   toggle and the shared base-URL logic stay in one place. Each feature page
   still injects only the service(s) it needs.
