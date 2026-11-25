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
| `pnpm test`      | Unit-Tests mit Vitest (`pnpm test:watch` im Watch-Modus)         |
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

Unter `/payments` lassen sich alle nicht zugeordneten Testzahlungen in Schritt 1 suchen und wählen. Jede andere
Zahlung öffnet man direkt über `/payments/<id>/assign`, z. B. `/payments/pay-assigned/assign` für den bereits
zugeordneten Fall.

| Zahlung              | Fall                                               |
| -------------------- | -------------------------------------------------- |
| `pay-exact`          | Rechnung `418` passt genau (1.249,00 €)            |
| `pay-mismatch`       | Passende Rechnung `502` liegt 50,00 € höher (A4)   |
| `pay-assigned`       | Bereits zugeordnet                                 |
| `pay-unknown-sender` | Absender ohne Kunde (`customerId: null`), Randfall |
| `pay-many-invoices`  | Absender mit 28 Rechnungen, für die Paginierung    |

`420` ist bezahlt, `9999` existiert nicht.

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

- `payment:500`, `paymentSearch:500`, `search:500`, `assignment:500`: Serverfehler (`INTERNAL_ERROR`)
- `assignment:409`: Zahlung wurde inzwischen zugeordnet (`PAYMENT_ALREADY_ASSIGNED`)
- `assignment:409-invoice`: Rechnung ist nicht mehr offen (`INVOICE_NOT_OPEN`)

In der Browser-Konsole setzt `__mockDb.reset()` nur die Daten zurück.

## Aufbau

```
src/
  main.tsx              Einstiegspunkt
  index.css             Tailwind v4, HeroUI, Schrift, Anpassungen an HeroUI-Komponenten (keine tailwind.config.js)
  themes/petrol.css     Theme: Farben, Radien, Schatten (überschreibt HeroUI-Variablen)
  app/AppProviders.tsx  QueryClient, Sprache, Toasts, Query-Devtools (nur Dev)
  app/router.tsx        Routen (react-router, Data Mode), Pfade in app/paths.ts
  app/RouteError.tsx    Fehlerseite der Routen
  app/shell/            App Shell, eine Komponente pro Aufgabe
    AppShell.tsx        Layout: Sidebar (mobil: Kopfzeile), Seite
    MobileHeader.tsx    Kopfzeile auf kleinen Bildschirmen: Menü-Button und Logo
    LocaleMenu.tsx      Sprachwahl, unten in Sidebar und Drawer
    navigation/         Sidebar (Desktop), Drawer (Mobil), NavList/NavItem, navItems.ts
      navigationStore.ts  Zustand: Sidebar eingeklappt (gespeichert)
  pages/                Seiten, eine Datei pro Route, StatusPage für Fallback-Seiten
    SelectPaymentPage   /payments, Schritt 1: Zahlung wählen
    AssignPaymentPage   /payments/:paymentId/assign, lädt die Zahlung (Fehler, Skeleton)
  features/payment-assignment/  Zuordnung, ein Unterordner pro Schritt
    PaymentSelection    Ablauf ohne gewählte Zahlung: nur Schritt 1 ist offen
    PaymentAssignment   Steuert den Ablauf: hält Rechnung, Aufteilung und Dialog, zeigt je Zustand die Schritte
    PaymentAssignmentSkeleton  Schritte, während die Zahlung lädt
    steps/              AssignmentSteps: Reihenfolge, Titel und Sperrhinweise der Schritte
    payment/            Schritt 1: PaymentSummary, Zahlungsdaten (nur Anzeige, A11)
      search/           Suche über nicht zugeordnete Zahlungen (ComboBox)
    invoice/            Schritt 2: Rechnung wählen und ändern, InvoiceSummary, Betragsabweichung (A4)
      AssignedNotice    Ersetzt die Auswahl, wenn die Zahlung schon zugeordnet ist
      MismatchAcknowledgement  Hinweis auf die Differenz und Checkbox zur Bestätigung im Dialog
      search/           Rechnungsauswahl (ComboBox) mit serverseitiger Suche und Paginierung
        useInvoiceNumberLookup  Löst eine eingetippte Nummer auf (beim Verlassen oder mit Enter)
        invoiceInput.ts         Fehlerfälle einer eingetippten Nummer (nicht gefunden, nicht offen)
    fee-splitter/       Fee Splitter: Gebühren und Auszahlung (berechnet, überschreibbar, A1)
      useSplitDraft     Entwurf der Aufteilung, Auswertung, berührte Felder
      SplitErrorAlert   Fehler der Aufteilung (Gebühren zu hoch, Summe stimmt nicht)
    confirmation/       Summary Section als Bestätigungsdialog (A2)
      ConfirmAssignment        Button unter den Schritten, nennt fehlende Eingaben, öffnet den Dialog
      ConfirmAssignmentDialog  Modal: Zusammenfassung von allem, was gespeichert wird; Differenz bestätigen (A4)
      SplitBreakdown           Zahlung, Gebühren, Auszahlung im Dialog
      useAssignPayment         useMutation zum Absenden, Erfolgstoast, hält Zahlungen und Rechnungen im Cache aktuell
      assignmentFailure        Fehlercodes des Servers als Fehlerarten, die der Nutzer beheben kann
      AssignmentErrorAlert     Fehler des Servers beim Absenden, je Fehlerart ein Text
  domain/assignment.ts  Was die Bestätigung blockiert, Splits für die API
  domain/invoice.ts     Nur offene Rechnungen wählbar (A3), Differenz zwischen Zahlung und Rechnung
  domain/split.ts       Aufteilung in Cent: Entwurf, Berechnung, Prüfung (reine Funktionen)
  lib/money.ts          Beträge ohne React: Eingabe in Cent umrechnen, Obergrenze
  lib/useFormatMoney.ts Beträge in der aktiven Sprache formatieren
  lib/useFormatDate.ts  Fälligkeit (reines Datum, UTC) und Zeitpunkte in der aktiven Sprache formatieren
  i18n/                 react-intl + React Aria mit einer gemeinsamen Sprachquelle
    localeStore.ts      Zustand: gewählte Sprache (gespeichert)
    messages/*.json     Texte, flache Schlüssel mit Punkten, ICU-Platzhalter
  app/queryClient.ts    Standardoptionen für TanStack Query (Retry nur bei Server- und Netzwerkfehlern)
  components/Typography HeroUI Typography mit elementType: Optik (type) und HTML-Element getrennt wählbar
  lib/usePagedSearch.ts Verzögerte Suche mit Paginierung für Zahlungen und Rechnungen
  components/           Seitenübergreifend: Page, steps/, BlockableButton, search/, SelectionSummary (gewählte Zahlung oder Rechnung, auch im Dialog), Notice, MoneyField (Cent)
  api/                  Typen des API-Vertrags, fetch-Client, Query-Optionen
  mocks/                MSW: Handler, Testdaten, In-Memory-DB, Szenarien
    browser.ts          Start im Browser (nur Dev)
    node.ts             setupServer für Vitest
```

Neue Texte kommen in `en.json` und `de.json`. Fehlt ein Schlüssel in `de.json`, schlägt der Typecheck fehl.
