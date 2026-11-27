# Libraries

| Area | Library | Why |
|---|---|---|
| Language | TypeScript (strict) | Given; the main safeguard for money amounts |
| Framework / build | React 19, Vite | React 19 is required by HeroUI v3. Client-only app, so no Next.js; Vitest shares the Vite config |
| Package manager | pnpm | Strict dependency resolution, exact versions from the lockfile |
| UI | HeroUI v3, Tailwind CSS v4 | Given; built on React Aria, so combobox, modal and number field come accessible |
| Server state | TanStack Query v5 | Given |
| Routing | react-router v8 (data mode) | Given |
| Client state | Zustand with `persist` | Given; only the chosen language |
| Forms | none: `useState` + pure functions | See below |
| i18n | react-intl | Amount input and messages depend on the locale |
| API mocking | MSW v3 | No backend exists |
| Tests | Vitest, Testing Library, user-event, jsdom | |
| Code quality | ESLint (`strictTypeChecked`), Prettier | |
| Other | lucide-react, IBM Plex Sans (self-hosted) | |
