# Geplante Libraries

Geplanter Technologie-Stack mit Begründung. **Vorgegeben** sind HeroUI v3, TanStack Query, react-router und Zustand
(nur bei Bedarf). Alles Übrige ist eine eigene Wahl.
Zugehörige Annahmen, Entscheidungen und offene Fragen stehen in [assumptions.md](assumptions.md).

## Übersicht

| Bereich | Library | Vorgabe / Wahl |
|---|---|---|
| Sprache | TypeScript (strict) | Vorgabe |
| Framework | React 19 | Voraussetzung für HeroUI v3 |
| Build | Vite | Wahl |
| Paketmanager | pnpm | Wahl |
| UI-Komponenten | HeroUI v3 | Vorgabe |
| Styling | Tailwind CSS v4 | Voraussetzung für HeroUI v3 |
| Schrift | IBM Plex Sans (`@fontsource-variable/ibm-plex-sans`, selbst gehostet) | Wahl |
| Icons | lucide-react | Wahl |
| Server-State | TanStack Query v5 | Vorgabe |
| Routing | react-router v8 (Data Mode) | Vorgabe |
| Formulare / Validierung | ohne Library: `useState` + reine Funktionen in `domain/` | Wahl |
| Client-State | Zustand (mit `persist`) | Vorgabe |
| i18n | react-intl (FormatJS) | vorläufig (D1) |
| API-Mocking | MSW v3 | vorläufig (A10) |
| Tests | Vitest + React Testing Library + user-event | Wahl |
| Codequalität | ESLint (typescript-eslint, react-hooks, @tanstack/eslint-plugin-query, simple-import-sort) + Prettier | Wahl |

---

## Begründungen

### React 19 + TypeScript + Vite
- HeroUI v3 setzt React 19 voraus.
- TypeScript im `strict`-Modus ist vorgegeben. Es ist auch der wichtigste Schutz bei Geldbeträgen, etwa durch einen eigenen Typ `Cents`.
- Vite ist der Standard für reine Client-Anwendungen: schneller Dev-Server, und Vitest nutzt dieselbe Konfiguration. Server-Rendering braucht die Aufgabe nicht, deshalb kein Next.js und kein Framework-Modus von react-router.

### pnpm
- Schnell und mit strikter Auflösung der Abhängigkeiten: Nicht deklarierte Pakete lassen sich nicht importieren.
- Die geforderte Version steht in `devEngines.packageManager` in der `package.json` (`^12.11.2`). Mit einer älteren pnpm-Version bricht `pnpm install` ab.
- Die genaue Version hält die `pnpm-lock.yaml` fest. `pnpm install --frozen-lockfile` erzwingt sie, damit alle Prüfer dieselbe pnpm-Version nutzen.
- Das übliche `packageManager`-Feld wird **nicht** genutzt: pnpm löst seine eigene Version nur über die globale Registry-Konfiguration auf, und die Firmen-Registry liefert dafür 403. Corepack wertet `devEngines` nicht aus, deshalb muss pnpm 12 global installiert sein (siehe `ui/README.md`).

### HeroUI v3 + Tailwind CSS v4 *(Vorgabe)*
- Baut auf **React Aria Components** auf. Barrierefreiheit, Tastaturbedienung und Fokusführung (Combobox, Modal) sind dadurch bereits gelöst.
- Die für die Aufgabe wichtigen Komponenten sind vorhanden:

| Komponente | Einsatz |
|---|---|
| `NumberField` | Gebühren. Liest Eingaben passend zur Sprache, Zahl ohne Symbol, Währung als `InputGroup.Suffix`, `minValue={0}`. |
| `ComboBox` | Rechnungssuche (Bonus: Autocomplete). Für freie Eingabe der Nummer mit `allowsCustomValue`. Die klassische Combobox ist `ComboBox`, nicht die v3-Komponente `Autocomplete`. |
| `Modal` / `AlertDialog` | Bestätigungsschritt (Bonus) |
| `Toast` | Erfolgsmeldung |
| `Alert`, `FieldError` | Warnungen und Fehlermeldungen |
| `Card`, `Skeleton` | Layout und Ladezustände |

- Bekannte Stolperstellen:
  - `NumberField` liefert eine Gleitkommazahl und für ein leeres Feld `NaN`. Die Umrechnung in Cent passiert deshalb direkt am Feld.
  - Bei serverseitiger Suche muss der eingebaute Client-Filter der `ComboBox` ausgeschaltet werden. Dazu werden `items` und `inputValue` von außen gesteuert.
  - Die eingebaute Validierung von React Aria wird **nicht** genutzt. Die Komponenten bekommen nur `isInvalid` und die Fehlermeldung aus der eigenen Prüfung (siehe Formular-State). Ausnahme: `minValue={0}` am `NumberField` lässt negative Eingaben gar nicht erst zu.
- Tailwind v4 wird über CSS konfiguriert (`@import "tailwindcss"`), eine `tailwind.config.js` gibt es nicht mehr.

### TanStack Query v5 *(Vorgabe)*
- Verwaltet die Server-Daten: Zahlung, Rechnungssuche, Absenden der Zuordnung.
- Rechnungssuche über `queryKey: ['invoices', { search, customerId }]` mit verzögertem Suchbegriff (Debounce), `placeholderData: keepPreviousData` und `signal` zum Abbrechen. Damit kann eine veraltete Antwort keine neuere überschreiben.
- Die Zuordnung läuft über `useMutation`:
  - `isPending` sperrt den Bestätigen-Button gegen doppeltes Absenden.
  - Nach Erfolg gilt die Zahlung im Cache als zugeordnet, die Zahlungssuche wird verworfen, die Rechnungen gelten als veraltet. Danach öffnet sich die Zahlungsauswahl.
- Die Query Devtools sind nur in der Entwicklung aktiv.

### react-router v8, Data Mode *(Vorgabe)*
- Wird mit `createBrowserRouter` eingesetzt statt mit `<BrowserRouter>`, denn nur so funktionieren die Fehlerseiten der Routen (**`errorElement`**).
- Daten werden **nicht** über `loader` geladen, sondern nur über TanStack Query. So gibt es einen einzigen Cache und keine doppelte Datenhaltung.
- Die HeroUI-Komponenten (React Aria) navigieren über `RouterProvider` aus `@heroui/react` in der Wurzelroute
  (`RouterLinkProvider`), angebunden an `useNavigate` und
  `useHref`. Links mit `href` laden die Seite dadurch nicht neu. `routerOptions` ist über eine Typ-Erweiterung von
  `react-aria-components` typisiert (`routerConfig.d.ts`), deshalb ist das Paket eine direkte Abhängigkeit.
- Routen: `/payments` (Schritt 1, Zahlung wählen) und `/payments/:paymentId/assign` (gewählte Zahlung, Schritte 2 und 3). Beide zeigen denselben Prozess. Der Bestätigungsschritt ist ein Modal, keine eigene Route, damit die Eingaben beim Neuladen nicht verloren gehen.

### Formular-State ohne Library *(Wahl)*

**Entscheidung:** `useState` in einem Custom Hook, Berechnung und Prüfung als reine Funktionen. Ursprünglich war TanStack Form
mit zod geplant.

| Kriterium | ohne Library | TanStack Form + zod | React Hook Form |
|---|---|---|---|
| Passt zu React Aria (Felder werden von außen gesteuert) | ✅ | ✅ von Haus aus | ⚠️ jedes Feld braucht einen `Controller` |
| Feldübergreifende Prüfung (Gebühren ≤ Betrag, Summe = Betrag) | ✅ eine reine Funktion | ✅ Validator auf Formularebene | ⚠️ `superRefine` + `trigger()` von Hand |
| Zustände wie „berührt“, „wird abgeschickt“ | ⚠️ selbst gebaut (ein `Set`, `isPending` der Mutation) | ✅ | ✅ |
| Zusätzliche Abhängigkeiten | ✅ keine | ❌ zwei | ❌ eine bis zwei |

- **Warum ohne Library:** Das Formular hat ein Rechnungsfeld und vier Beträge. Typprüfung und Parsen übernimmt das
  `NumberField`, die Beträge kommen bereits als Cent an. Übrig bleiben zwei feldübergreifende Regeln. Dafür lohnen sich
  zwei Libraries nicht, und Berechnung und Prüfung bleiben ohne React testbar.
- **Warum nicht React Hook Form:** Die Stärke von RHF ist, Werte direkt aus nativen Eingabefeldern zu lesen. Diese
  Stärke fällt weg, weil die HeroUI-Komponenten gesteuert werden müssen.
- **Umsetzung:**
  - `domain/split.ts` enthält Entwurf (`SplitDraft`) und eine Funktion `evaluateSplit`, die Berechnung und Prüfung
    zusammen liefert. Die Prüfung liefert Fehlercodes mit Beträgen, die Komponenten machen daraus ICU-Texte.
  - `useSplitDraft` hält Entwurf und berührte Felder, ruft `evaluateSplit` einmal pro Rendern auf und bietet Setter
    mit Updater-Funktionen an. `PaymentAssignment` nutzt den Hook und gibt das Ergebnis als ein Objekt weiter, damit
    Aufteilung und Bestätigungsdialog dieselben Werte zeigen. Die Seite selbst lädt nur die Zahlung.
  - Gespeichert wird nur, was der Nutzer eingibt. Der vorgeschlagene Merchant-Betrag wird bei jedem Rendern berechnet,
    als State existiert nur eine Überschreibung (`merchantOverride`, A1).
  - `components/MoneyField` bindet das `NumberField` einmal an Cent an (`null` für ein leeres Feld). Mehr als zwei
    Nachkommastellen rundet es nicht, sondern gibt sie als `{ tooPrecise: euros }` weiter, damit kein anderer Betrag als
    der eingegebene übernommen wird. Die Umrechnung (`toAmountInput`, `toEuros`) liegt als reine Funktion in
    `lib/money.ts`, die Formatierungs-Hooks liegen getrennt in `lib/useFormatMoney.ts`, damit `domain/` kein React
    importiert.
  - Fehlende Eingaben erscheinen beim Verlassen eines Feldes, nicht bei jedem Tastendruck. Welche Felder schon verlassen
    wurden, hält `useSplitDraft`. Was noch fehlt, steht neben dem gesperrten Bestätigen-Button.
    Die Summe wird erst geprüft, wenn alle Felder gültig sind.

### Zustand + `persist` *(Vorgabe)*
- Jede Art von State hat genau einen Platz:
  - Server-Daten → TanStack Query
  - Formularwerte → `useState` in `PaymentAssignment` bzw. `useSplitDraft`, Berechnung und Prüfung als reine Funktionen in `domain/`
  - App-weiter Client-State (Sprachwahl, Sidebar eingeklappt) → Zustand
  - State, den nur eine Komponente braucht (mobiles Menü offen, Modal offen) → `useState`
- Ein Store pro Thema, neben dem Code, der ihn nutzt:
  - `i18n/localeStore.ts`: Sprache. Startwert aus der Browsersprache, die Wahl des Nutzers wird gespeichert.
  - `app/shell/navigation/navigationStore.ts`: Sidebar eingeklappt.
- `persist` schreibt in `localStorage`. `partialize` legt fest, was gespeichert wird. `merge` übernimmt nur gültige
  Werte, damit ein veralteter oder von Hand geänderter Eintrag die App nicht in einen ungültigen Zustand bringt.
  Ist `localStorage` gesperrt (privater Modus), läuft die App ohne Speichern weiter.
- Komponenten lesen mit Selektoren (`useLocaleStore((s) => s.locale)`), damit sie nur bei Änderung dieses Werts neu rendern.
- Server-Daten kommen **nicht** in Zustand, sonst gäbe es sie doppelt neben dem Query-Cache.

### react-intl (FormatJS) *(vorläufig)*
- Texte liegen in `de.json` und `en.json`. Die Schlüssel sind flach und durch Punkte gegliedert. Platzhalter folgen der ICU-Syntax (`{amount}`).
- Beträge werden mit `intl.formatNumber(cents / 100, { style: 'currency', currency })` angezeigt. Im `NumberField` steht die Zahl mit denselben Trennzeichen, das Währungssymbol als Suffix daneben.
- **Eine Sprachquelle** für `IntlProvider` (react-intl) und `I18nProvider` (React Aria) (D1).
- Die Message-IDs sind typisiert: Über die globalen FormatJS-Typen (`FormatjsIntl.Message`) gelten die Schlüssel aus `en.json` als einzige erlaubten IDs. Eine unbekannte ID an `<FormattedMessage>` oder `formatMessage` schlägt schon im Typecheck fehl.
- Fehlt in `de.json` ein Schlüssel, meldet das der Typecheck (`satisfies`). Ein Test prüft zusätzlich, dass `de.json` keine überzähligen Schlüssel enthält.

### MSW v3 *(vorläufig)*
- Fängt `fetch` auf Netzwerkebene ab. Die App-Logik bleibt dadurch unverändert, wenn später eine echte API angebunden wird.
- Dieselben Handler laufen im Browser (Service Worker) und in Vitest (`setupServer`).
- Verzögerung und Fehlerfälle lassen sich über URL-Parameter steuern (siehe `ui/README.md`, „Szenarien“).
- Das Vite-Plugin `msw/vite` liefert den Service Worker im Dev-Server aus. Es läuft im Modus `worker-only`, damit die
  stabile `setupWorker`-API genutzt wird und nicht das experimentelle `virtual:msw`. Eine generierte
  `public/mockServiceWorker.js` gibt es deshalb nicht, und der Produktions-Build enthält weder Worker noch Handler.

### Vitest + React Testing Library + user-event
- Vitest nutzt die Vite-Konfiguration, ein eigenes Build-Setup ist nicht nötig. Die API ist mit Jest kompatibel.
- Was getestet wird:
  - **Unit-Tests:** Berechnung des Splits, Cent-Umrechnung, Schema (Grenzfälle wie Summe > Betrag, 0, mehr als 2 Nachkommastellen, leeres Feld).
  - **Integrationstests:** Rechnung suchen und wählen, Gebühren eingeben, Fehleranzeige, Bestätigungsdialog, Fehler beim Absenden. Alles gegen die MSW-Handler.
- Tests laufen mit **fester Sprache**, damit Zahlenformate in den Prüfungen nicht von der Rechnerumgebung abhängen.
- Testumgebung `jsdom`. Falls React Aria dort Probleme macht (z. B. Pointer-Events), ist `happy-dom` die Alternative.

### ESLint + Prettier
- `typescript-eslint` mit den strengsten typgestützten Regelsätzen (`strictTypeChecked` + `stylisticTypeChecked`).
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (prüft, dass Hot Reload in Vite funktioniert) und `@tanstack/eslint-plugin-query`. Letzteres erkennt unvollständige Query-Keys.
- `eslint-plugin-simple-import-sort` legt die Reihenfolge der Importe fest: erst Pakete, dann relative Importe, jeweils alphabetisch. `pnpm lint:fix` sortiert automatisch.
- Prettier kümmert sich nur um die Formatierung, ESLint nur um Regeln. `eslint-config-prettier` schaltet dazu alle ESLint-Regeln ab, die mit Prettier kollidieren würden.

---

## Bewusst nicht eingesetzt

| Library | Grund |
|---|---|
| Redux / RTK | Unnötig: Server-State liegt in Query, Formular-State ist lokal |
| TanStack Form, zod, React Hook Form | Für ein Rechnungsfeld und vier Beträge zu viel, siehe Formular-State |
| Formik | Wird kaum noch weiterentwickelt, schwache Typisierung |
| dinero.js / big.js | Es gibt nur Addition und Subtraktion ganzer Cent-Beträge (A8). Ein kleines eigenes Modul reicht. Bei Prozent-Gebühren oder mehreren Währungen neu bewerten. |
| axios | `fetch` reicht, und MSW fängt es direkt ab |
| date-fns / dayjs | Datumsanzeige über `Intl` bzw. react-intl (`formatDate`) |
| Lodash (z. B. `debounce`) | Ein kleiner `useDebouncedValue`-Hook genügt |
