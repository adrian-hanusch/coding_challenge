# Payment Management UI

Frontend der Coding Challenge. Stack und Begründungen: [docs/libraries.md](../docs/libraries.md).

## Voraussetzungen

- Node.js 24
- pnpm 12, z. B. über Corepack: `corepack enable pnpm && corepack install -g pnpm@12`

Die geforderte pnpm-Version steht in `devEngines.packageManager` in der `package.json`. Corepack wertet dieses Feld
nicht aus, deshalb muss pnpm 12 global installiert sein. Mit einer älteren Version bricht `pnpm install` mit einer
Fehlermeldung ab.

## Befehle

| Befehl           | Zweck                                                            |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm install`   | Abhängigkeiten installieren                                      |
| `pnpm dev`       | Dev-Server auf http://localhost:5173                             |
| `pnpm build`     | Typecheck und Produktions-Build nach `dist/`                     |
| `pnpm typecheck` | Nur TypeScript prüfen                                            |
| `pnpm lint`      | ESLint (`pnpm lint:fix` behebt, was automatisch geht)            |
| `pnpm format`    | Prettier formatiert alle Dateien (`pnpm format:check` prüft nur) |
| `pnpm preview`   | Produktions-Build lokal ausliefern                               |

Die `.npmrc` in diesem Ordner setzt die öffentliche npm-Registry.

## Aufbau

```
src/
  main.tsx              Einstiegspunkt
  index.css             Tailwind v4 + HeroUI-Styles (keine tailwind.config.js)
  app/AppProviders.tsx  QueryClient, Sprache, Toasts, Query-Devtools (nur Dev)
  app/App.tsx           Platzhalterseite
  i18n/                 react-intl + React Aria mit einer gemeinsamen Sprachquelle
    messages/*.json     Texte, flache Schlüssel mit Punkten, ICU-Platzhalter
  lib/queryClient.ts    Standardoptionen für TanStack Query
```

Neue Texte kommen in `en.json` und `de.json`. Fehlt ein Schlüssel in `de.json`, schlägt der Typecheck fehl.
