# TV Shows App

A responsive TV show discovery application built with **Vue 3, TypeScript, Vite, Pinia, and Vue Router**, using the public **TVMaze API**.

The application allows users to:

- discover TV shows grouped by genre
- browse shows sorted by rating within each genre
- search for shows by name
- progressively explore additional shows for a selected genre
- view detailed information about an individual show
- navigate through a responsive and accessible interface

The implementation focuses on the requirements of the assessment while demonstrating production-oriented frontend engineering practices such as **clear separation of concerns, feature-based architecture, resilient API communication, reusable components, accessibility, testing, and explicit architectural trade-offs**.

---

## Requirements Coverage

| Requirement                   | Implementation                         |
| ----------------------------- | -------------------------------------- |
| Display TV shows              | Home dashboard                         |
| Group shows by genre          | `groupShowsByGenre`                    |
| Sort shows by rating          | `sortShowsByRating`                    |
| Horizontal genre lists        | `ShowCarousel`                         |
| Search by show name           | `SearchBar` + TVMaze search API        |
| Show details                  | `ShowDetailsView`                      |
| Browse more shows by genre    | `GenreView` + `useGenreShows`          |
| Responsive design             | Responsive carousel and grid layouts   |
| Loading feedback              | Boot skeleton + `ShowSkeleton`         |
| Error handling                | `ErrorState` + API error normalization |
| Shared state                  | Pinia                                  |
| Route-specific reactive state | Vue composables                        |
| Unit testing                  | Vitest + Vue Test Utils                |

---

## Tech Stack

- **Vue 3** — Composition API and `<script setup>`
- **TypeScript** — static typing throughout the application
- **Vite** — development server and production build tooling
- **Pinia** — shared application state
- **Vue Router** — client-side routing
- **Vitest** — unit testing
- **Vue Test Utils** — Vue component testing
- **ESLint** — static analysis
- **TVMaze API** — external TV show data source

The dependency footprint is intentionally kept small.

Functionality such as caching, retry handling, debouncing, validation, environment configuration, and logging is implemented using lightweight internal utilities rather than introducing libraries for relatively small concerns.

---

## Getting Started

### Prerequisites

A recent Node.js version and npm are required.

The project was developed using a modern Node.js environment.

Check your local versions with:

```bash
node --version
npm --version
```

### Install dependencies

```bash
npm install
```

If your local environment encounters peer dependency resolution issues:

```bash
npm install --legacy-peer-deps
```

### Start the development server

```bash
npm run dev
```

Open the URL displayed by Vite in the terminal.

### Production build

```bash
npm run build
```

### Run tests

```bash
npm run test
```

### Run tests in CI mode

```bash
npm run test:run
```

### Run linting

```bash
npm run lint
```

> The available commands are defined in `package.json`.

---

## Environment Configuration

The TVMaze API URL can be configured using a Vite environment variable:

```env
VITE_TVMAZE_API_URL=https://api.tvmaze.com
```

The application reads environment configuration through:

```text
src/shared/utils/environment/environment.ts
```

A default TVMaze API URL is provided by the application, so local development does not depend on manually configuring the environment unless the API URL needs to be overridden.

---

# Architecture

The project uses a **feature-oriented architecture**.

Instead of placing all application components, services, and utilities into large global folders, functionality belonging to the TV show domain is colocated under:

```text
src/features/shows/
```

The high-level structure is:

```text
src/
├── app/
│   ├── App.vue
│   ├── App.spec.ts
│   ├── main.ts
│   └── router/
│       └── index.ts
│
├── features/
│   └── shows/
│       ├── api/
│       │   ├── apiClient/
│       │   ├── apiError/
│       │   └── showsApi/
│       │
│       ├── components/
│       │   ├── ShowCard/
│       │   ├── ShowCarousel/
│       │   ├── ShowInfo/
│       │   └── ShowSkeleton/
│       │
│       ├── composables/
│       │   └── useGenreShows/
│       │
│       ├── stores/
│       │   └── shows.store.ts
│       │
│       ├── types/
│       │
│       ├── utils/
│       │   ├── groupShowsByGenre/
│       │   └── sortShowsByRating/
│       │
│       └── views/
│           ├── GenreView/
│           ├── HomeView/
│           ├── NotFoundView/
│           └── ShowDetailsView/
│
├── layouts/
│   └── AppLayout/
│
└── shared/
    ├── components/
    │   ├── AppHeader/
    │   ├── ErrorState/
    │   └── SearchBar/
    │
    ├── styles/
    │
    └── utils/
        ├── cache/
        ├── debounce/
        ├── environment/
        ├── logging/
        ├── retry/
        ├── types/
        └── validation/
```

The main dependency flow is:

```text
Application bootstrap
        ↓
Router / Views
        ↓
Feature components
        ↓
Store / Composables
        ↓
Shows API
        ↓
API Client
        ↓
TVMaze API
```

This keeps UI components focused on presentation while data access, shared state, reactive feature behaviour, and infrastructure concerns remain in dedicated layers.

---

# Key Architectural Decisions

## 1. Feature-Based Organization

TV show functionality lives under:

```text
src/features/shows/
```

This keeps domain-specific code together and provides a clear boundary between show functionality and generic application functionality.

If the application grows, additional features can be introduced independently:

```text
features/
├── shows/
├── favourites/
└── authentication/
```

Domain-independent functionality remains under:

```text
src/shared/
```

This prevents the shared layer from becoming coupled to TV show business logic.

---

## 2. Pinia Only for Shared Application State

Pinia is used for state that needs to be shared across different parts of the application.

The show store manages concerns such as:

- initially loaded shows
- search results
- selected show details
- shared loading states
- shared error states
- show/search cache coordination

This provides predictable state ownership without passing the same data through multiple component levels.

However, not every reactive value is placed in Pinia.

The guiding rule is:

```text
Shared application state
        → Pinia

Route/feature-specific reactive behaviour
        → Composable

Pure transformation logic
        → Utility
```

Keeping state at the narrowest appropriate scope avoids unnecessarily growing the global store.

---

## 3. Genre Loading Uses a Dedicated Composable

Genre exploration has different requirements from the Home dashboard.

It needs to manage:

- the selected genre
- current TVMaze catalogue page
- progressive page loading
- genre filtering
- duplicate prevention
- loading state
- end-of-catalogue detection
- incremental error handling

This behaviour is encapsulated in:

```text
src/features/shows/composables/useGenreShows/
```

rather than being placed inside `GenreView.vue` or the global Pinia store.

This keeps `GenreView` primarily responsible for:

- reading route state
- navigation
- presentation

The logic was also intentionally not implemented as a generic utility because it contains **reactive state, asynchronous API calls, and side effects**. A Vue composable is a more appropriate abstraction.

---

## 4. API Access Is Separated from UI Logic

Views and components do not call `fetch()` directly.

The API architecture is:

```text
shows.api.ts
      ↓
api-client.ts
      ↓
fetch()
      ↓
TVMaze
```

### `shows.api.ts`

Contains TVMaze/domain-specific operations such as:

```text
getShows()
searchShows()
getShowById()
```

### `api-client.ts`

Handles HTTP infrastructure concerns such as:

- GET requests
- request timeout
- retry behaviour
- caching
- error normalization
- request logging

This separation allows HTTP infrastructure to evolve independently from components and domain-specific API operations.

---

# TVMaze API Strategy

The application primarily uses:

```text
GET /shows?page=:page
GET /search/shows?q=:query
GET /shows/:id
```

An important limitation of the TVMaze API influenced the application architecture:

**TVMaze does not provide a dedicated public genre-filtered pagination endpoint.**

There is no equivalent endpoint such as:

```text
GET /shows?genre=drama&page=1
```

Genres are provided as properties of individual shows.

As a result, genre exploration requires retrieving Show Index pages and filtering their results using each show's `genres` property.

---

## Home Dashboard Strategy

The Home dashboard intentionally loads only the **initial TVMaze Show Index page**.

The returned shows are:

1. grouped by genre
2. sorted by rating within each genre
3. displayed as horizontal carousels

Conceptually:

```text
TVMaze page 0
      ↓
groupShowsByGenre()
      ↓
sortShowsByRating()
      ↓
genre carousels
```

This is a deliberate performance trade-off.

It allows useful content to render without downloading the complete TVMaze catalogue before the user can interact with the application.

### Known limitation

Because TVMaze exposes genres only as properties of individual shows, the first Show Index page does **not guarantee that every genre in the complete TVMaze catalogue is represented**.

Therefore, the genres displayed on Home should be considered the genres discovered in the initial dataset rather than an exhaustive catalogue of every possible TVMaze genre.

For the scope of this frontend assessment, this trade-off keeps the initial request lightweight.

A production solution is discussed later in this README.

---

## Genre Exploration Strategy

Selecting **View all** opens the dedicated Genre view.

Unlike the Home dashboard, the Genre view progressively explores additional TVMaze Show Index pages.

Conceptually:

```text
/shows?page=0
      ↓
filter selected genre

/shows?page=1
      ↓
filter selected genre

/shows?page=2
      ↓
filter selected genre

...
```

This behaviour is managed by `useGenreShows`.

A single **Load more** action may inspect multiple upstream TVMaze pages.

For example:

```text
page 3 → no Drama shows
page 4 → no Drama shows
page 5 → 8 Drama shows
```

The composable can continue through pages that contain no matching results until it finds additional shows for the selected genre or reaches the end of the TVMaze catalogue.

This avoids requiring the user to repeatedly click **Load more** for API pages that contain no relevant results.

It also allows deeper catalogue exploration without downloading the entire TVMaze dataset during initial application startup.

---

# Search Strategy

Search uses:

```text
GET /search/shows?q=:query
```

The search input is **debounced** to avoid unnecessary requests while the user is typing.

TVMaze search is fuzzy and can return shows whose names do not directly contain the user's entered text.

To provide more predictable UI behaviour, the returned results are additionally filtered client-side using a case-insensitive title match:

```ts
show.name.toLowerCase().includes(normalizedSearch)
```

Search results are then grouped using the same genre transformation logic as the Home dashboard.

Search state is also represented in the route query:

```text
/?q=office
```

This means browser navigation can restore the current search context rather than keeping it only inside component-local state.

---

# Data Transformation

API retrieval and UI transformation are intentionally separated.

Two focused utilities handle the main dashboard transformations:

```text
groupShowsByGenre/
sortShowsByRating/
```

The data flow is:

```text
TVMaze shows
     ↓
groupShowsByGenre()
     ↓
genre groups
     ↓
sortShowsByRating()
     ↓
UI-ready genre sections
```

These functions are:

- pure
- independently testable
- independent from Vue
- independent from HTTP concerns

A show can belong to multiple genres and can therefore intentionally appear in multiple genre sections.

Shows without an average rating are treated as lower-rated when sorting.

---

# Component Design

Components are kept focused on a single UI responsibility.

### `ShowCard`

Displays a reusable preview of an individual show.

### `ShowCarousel`

Displays a genre section as a horizontally scrollable list of show cards.

### `ShowInfo`

Displays detailed information for an individual show.

### `ShowSkeleton`

Provides reusable loading feedback after the Vue application has mounted.

### `SearchBar`

Owns search input interaction, validation, clear behaviour, and debouncing.

### `ErrorState`

Provides reusable error presentation and retry interaction.

### `AppHeader`

Contains application-level header and search functionality.

This keeps components reusable and prevents presentation components from becoming directly coupled to API implementation details.

---

# Loading Experience

Loading is handled at **two different stages**.

## 1. Application Boot Loading

On a slow connection, the browser may still be downloading the Vue application itself.

A Vue component cannot render until the JavaScript application has loaded and Vue has mounted.

For that reason, `index.html` contains a lightweight static boot skeleton.

```text
Browser receives HTML
        ↓
Static boot skeleton
        ↓
Vue application downloads
        ↓
Vue mounts
```

This prevents the user from seeing a blank screen while the application bundle is still loading.

The boot skeleton requires no Vue runtime.

Once Vue mounts to `#app`, the static loader is automatically replaced by the Vue application.

---

## 2. Feature Data Loading

After Vue has mounted, loading states are handled inside the application using the reusable:

```text
ShowSkeleton.vue
```

The complete loading sequence therefore becomes:

```text
Static HTML boot skeleton
          ↓
Vue mounts
          ↓
ShowSkeleton.vue
          ↓
TVMaze API responds
          ↓
Actual show content
```

This provides meaningful visual feedback both before and after Vue becomes available.

---

# API Resilience

The API client includes defensive behaviour appropriate for communication with an external service.

## Request Timeout

Requests have a bounded timeout so the UI does not wait indefinitely for a slow or unresponsive upstream API.

## Retry with Backoff

Transient failures can be retried with controlled backoff.

Retryable cases include failures such as:

```text
429 Too Many Requests
5xx Server Errors
Network failures
```

Errors that are unlikely to succeed when repeated are not blindly retried.

## Error Normalization

Raw HTTP/network failures are normalized into application-level errors.

This means stores, composables, and views do not need to understand low-level `fetch()` failure behaviour.

## Caching

A lightweight TTL cache helps prevent unnecessary repeated requests during the same application session.

Feature-level caching is also used where retaining previously retrieved application data improves navigation behaviour.

## Stale Request Protection

Where multiple asynchronous requests can overlap, request tokens are used to prevent older responses from overwriting newer application state.

This is particularly useful for rapidly changing search requests and show-detail navigation.

---

# Error Handling

Errors are handled at the UI level where they occur.

### Initial loading failure

A reusable `ErrorState` is displayed with retry behaviour.

### Incremental genre loading failure

Previously loaded shows remain visible if a later **Load more** request fails.

The error is presented separately rather than replacing successfully loaded content.

### Search failure

Search-specific error state is kept separate from initial dashboard loading errors.

This avoids one operation incorrectly affecting unrelated UI state.

The application treats errors as expected application states rather than exceptional cases that should result in a broken interface.

---

# Accessibility

Accessibility was considered throughout implementation rather than added only at the end.

Examples include:

- semantic `<main>`, `<section>`, `<header>`, and heading elements
- native buttons and links instead of clickable `<div>` elements
- accessible labels for interactive controls
- descriptive image alternative text
- keyboard-accessible navigation
- visible `:focus-visible` states
- `aria-live` for asynchronous status updates
- `role="status"` for loading feedback
- `role="alert"` for errors
- decorative content hidden using `aria-hidden`
- reduced-motion support using `prefers-reduced-motion`
- responsive control sizing

The application also preserves semantic navigation through Vue Router links rather than implementing navigation using generic click handlers where a link is more appropriate.

---

# Responsive Design

The UI is designed for desktop, tablet, and mobile layouts.

The Home dashboard uses horizontally scrollable genre carousels, allowing many genre sections to remain compact.

Genre exploration uses a responsive grid.

Conceptually:

```text
Desktop
→ controlled-width show cards

Tablet
→ smaller responsive cards

Mobile
→ two-column grid
```

Card widths are deliberately constrained on larger screens so a small number of results does not cause individual cards to stretch across the entire page.

---

# Testing Strategy

Tests are colocated with the code they verify.

For example:

```text
ShowCard/
├── ShowCard.vue
├── ShowCard.css
└── ShowCard.spec.ts
```

and:

```text
groupShowsByGenre/
├── groupShowsByGenre.ts
└── groupShowsByGenre.spec.ts
```

This keeps implementation and test ownership close together.

The test suite covers areas including:

- component rendering
- props
- conditional rendering
- routing behaviour
- accessibility attributes
- search input validation
- debounce behaviour
- genre grouping
- rating sorting
- API behaviour
- API error handling

Pure transformation logic is tested independently from Vue components wherever possible.

---

# Responsibility Map

| Layer         | Responsibility                                     |
| ------------- | -------------------------------------------------- |
| `app`         | Application bootstrap, root configuration, routing |
| `views`       | Route-level presentation and orchestration         |
| `components`  | Reusable UI elements                               |
| `composables` | Feature/route-specific reactive behaviour          |
| `stores`      | Shared application state                           |
| `showsApi`    | TVMaze domain operations                           |
| `apiClient`   | HTTP infrastructure and resilience                 |
| `utils`       | Pure reusable logic                                |
| `types`       | TypeScript contracts                               |
| `shared`      | Domain-independent reusable functionality          |

A key design principle is to keep **state and behaviour at the narrowest appropriate scope**.

Not every piece of state belongs in a global store, and not every function needs to become a generic abstraction.

---

# Performance Considerations

Several implementation decisions are intended to keep the application responsive:

- only the initial Show Index page is loaded for Home
- search input is debounced
- repeated API responses can be cached
- show images use lazy loading
- genre exploration is progressive
- the complete TVMaze catalogue is not downloaded during startup
- API retries are bounded
- loading states provide immediate visual feedback
- stale asynchronous responses are prevented from overwriting newer state

The goal is to provide useful content quickly while avoiding unnecessary network requests and processing.

---

# Production Considerations

This implementation communicates directly with TVMaze because the assessment is frontend-focused.

For a larger production system, I would avoid making each browser responsible for discovering and filtering the complete external catalogue.

A more scalable architecture would introduce a **Backend-for-Frontend (BFF)** or backend catalogue service.

```text
TVMaze API
     ↓
Background synchronization
     ↓
Backend / BFF
     ↓
Database / Cache
     ↓
Vue application
```

The backend could periodically synchronize TVMaze data and maintain a complete catalogue of shows and genres.

The frontend could then consume application-specific endpoints such as:

```text
GET /api/home

GET /api/genres

GET /api/genres/:genre/shows
    ?limit=24
    &cursor=...
```

For example, `/api/home` could return only the top-rated shows required for each known genre.

The genre endpoint could provide true server-side filtering and cursor-based pagination.

This architecture would provide:

- complete genre discovery
- true server-side genre filtering
- server-side/cursor pagination
- smaller frontend payloads
- centralized caching
- reduced TVMaze traffic
- improved rate-limit management
- improved resilience if TVMaze is temporarily unavailable
- centralized observability
- more predictable sorting and filtering

This is intentionally not implemented for the assessment because introducing a backend would add infrastructure outside the requested frontend scope.

---

# Trade-offs

Several decisions were intentionally kept pragmatic.

## Home Uses a Partial Catalogue

Home prioritizes fast initial rendering over exhaustive genre discovery.

The first TVMaze Show Index page does not guarantee every possible genre.

## Genre Filtering Is Client-Side

TVMaze does not provide the genre-specific endpoint ideally required by this UI.

The frontend therefore progressively explores catalogue pages and filters them locally.

A BFF would be preferable for this concern in a larger production system.

## Lightweight Internal Utilities

Caching, retry handling, debouncing, logging, and validation are implemented using small internal utilities.

For a larger application with more complex requirements, established libraries may become appropriate.

## State Ownership

Only genuinely shared state is stored globally.

Route-specific genre exploration remains in a composable rather than increasing the responsibility of the Pinia store.

These decisions aim to keep the implementation proportional to the problem while leaving clear extension points.

---

# Future Improvements

Given additional production scope, useful next steps would include:

- BFF-based TVMaze catalogue synchronization
- complete server-side genre discovery
- server-side or cursor-based genre pagination
- persistent caching
- stronger API observability and telemetry
- end-to-end testing with Playwright
- automated accessibility testing
- CI quality gates for linting, testing, and production builds
- improved image fallback and optimization
- richer offline handling
- favourites/watchlist functionality

---

# Engineering Principles

The implementation follows a few guiding principles:

### Keep responsibilities explicit

Components render UI, stores manage shared state, composables encapsulate reactive feature behaviour, API modules communicate with external services, and utilities contain focused reusable logic.

### Keep state as local as possible

State is promoted to Pinia only when it genuinely needs to be shared.

### Prefer simple abstractions

The application avoids unnecessary generic layers while still separating concerns that are likely to evolve independently.

### Design for failure and slow networks

Loading, timeout, retry, caching, race conditions, and error states are treated as normal parts of application behaviour.

### Make trade-offs explicit

Limitations of the upstream API are documented together with the reasoning behind the frontend solution and how the architecture could evolve in production.

---

# Summary

The main architectural decisions in this project are:

1. **Feature-based organization** for clear domain ownership.
2. **Pinia for shared state**, rather than making all reactive state global.
3. **Composable-based genre loading** for route-specific behaviour.
4. **Separated API and HTTP layers** for loose coupling.
5. **Pure transformation utilities** for grouping and rating sorting.
6. **Progressive catalogue exploration** instead of bulk downloading the complete TVMaze dataset.
7. **Two-stage loading feedback** covering both application boot and API loading.
8. **Accessible and responsive reusable components**.
9. **Colocated tests** around components and business logic.
10. A documented **BFF strategy** for addressing upstream API limitations at production scale.

The overall goal is to keep the solution **simple, readable, testable, and proportionate to the assessment**, while making the architectural decisions and production trade-offs clear to the reviewer.
