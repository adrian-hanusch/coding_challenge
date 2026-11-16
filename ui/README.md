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

## Mock-API

Im Dev-Betrieb beantwortet [MSW](https://mswjs.io) alle Anfragen an `/api` direkt im Browser. Ein Backend ist nicht
nötig. Vertrag und Fehlercodes: [docs/data-model.md](../docs/data-model.md#api).

- Gesteuert über `VITE_API_MOCKING` in `.env.development` (Standard `true`). Für ein echtes Backend
  `VITE_API_MOCKING=false` in `.env.development.local` setzen. Vite leitet `/api` dann an `API_URL` weiter
  (Standard `http://localhost:8080`).
- Der Mock läuft nur mit `pnpm dev`. `pnpm build` und `pnpm preview` enthalten ihn nicht.
- Der Mock antwortet nur im Browser, nicht auf `curl`. Zum Ausprobieren in der Browser-Konsole:
  `await (await fetch('/api/payments/pay-exact')).json()`.
- Der Datenstand liegt in `sessionStorage`. Eine bestätigte Zahlung bleibt also nach einem Reload zugeordnet.

### Testfälle

| Zahlung              | Fall                                                      |
| -------------------- | --------------------------------------------------------- |
| `pay-exact`          | Rechnung `RE-2026-0418` passt genau (1.249,00 €)          |
| `pay-mismatch`       | Passende Rechnung `RE-2026-0502` liegt 50,00 € höher (A4) |
| `pay-assigned`       | Bereits zugeordnet                                        |
| `pay-unknown-sender` | Absender ohne Kunde (`customerId: null`), Randfall        |
| `pay-many-invoices`  | Absender mit 28 Rechnungen, für die Paginierung           |

`RE-2026-0420` ist bezahlt, `RE-2026-0377` storniert, `RE-2026-9999` existiert nicht.

`pay-unknown-sender` liegt außerhalb des Szenarios der Aufgabe (dort ist der Absender bekannt) und prüft, dass die
Seite auch ohne Kunden funktioniert.

### Szenarien

Als URL-Parameter, sie gelten bis zum Schließen des Tabs:

| Parameter                              | Wirkung                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| `?mock-delay=2000`                     | Feste Antwortzeit in ms (sonst zufällig 100–400 ms)      |
| `?mock-fail=assignment:409,search:500` | Endpunkte schlagen fehl, Werte siehe unten               |
| `?mock-fail=` / `?mock-delay=`         | Setzt den jeweiligen Schalter zurück                     |
| `?mock-reset`                          | Stellt die Testdaten wieder her und löscht alle Schalter |

Werte für `mock-fail`:

- `payment:500`, `search:500`, `assignment:500`: Serverfehler (`INTERNAL_ERROR`)
- `assignment:409`: Zahlung wurde inzwischen zugeordnet (`PAYMENT_ALREADY_ASSIGNED`)
- `assignment:409-invoice`: Rechnung ist nicht mehr offen (`INVOICE_NOT_OPEN`)

In der Browser-Konsole setzt `__mockDb.reset()` nur die Daten zurück.

## Aufbau

```
src/
  main.tsx              Einstiegspunkt
  index.css             Tailwind v4 + HeroUI-Styles (keine tailwind.config.js)
  app/AppProviders.tsx  QueryClient, Sprache, Toasts, Query-Devtools (nur Dev)
  app/router.tsx        Routen (react-router, Data Mode), Pfade in app/paths.ts
  app/RouteError.tsx    Fehlerseite der Routen
  app/shell/            App Shell, eine Komponente pro Aufgabe
    AppShell.tsx        Layout: Sidebar, Kopfzeile, Seite
    AppHeader.tsx       Kopfzeile mit Sprachwahl (mobil zusätzlich Menü-Button und Logo)
    navigation/         Sidebar (Desktop), Drawer (Mobil), NavList/NavItem, navItems.ts
      navigationStore.ts  Zustand: Sidebar eingeklappt (gespeichert)
  pages/                Seiten, eine Datei pro Route, StatusPage für Fallback-Seiten
  i18n/                 react-intl + React Aria mit einer gemeinsamen Sprachquelle
    localeStore.ts      Zustand: gewählte Sprache (gespeichert)
    messages/*.json     Texte, flache Schlüssel mit Punkten, ICU-Platzhalter
  lib/queryClient.ts    Standardoptionen für TanStack Query
  api/                  Typen des API-Vertrags, fetch-Client, Query-Optionen
  mocks/                MSW: Handler, Testdaten, In-Memory-DB, Szenarien
    browser.ts          Start im Browser (nur Dev)
    node.ts             setupServer für Vitest
```

Neue Texte kommen in `en.json` und `de.json`. Fehlt ein Schlüssel in `de.json`, schlägt der Typecheck fehl.
