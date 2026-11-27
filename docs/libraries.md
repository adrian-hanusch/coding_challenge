# Libraries

The technology stack and the reasons behind it. HeroUI v3, TanStack Query, react-router and Zustand (only where needed)
are **given**. Everything else is our own choice.
Related assumptions, decisions and open questions are in [assumptions.md](assumptions.md).

## Overview

| Area | Library | Given / choice |
|---|---|---|
| Language | TypeScript (strict) | Given |
| Framework | React 19 | Required by HeroUI v3 |
| Build | Vite | Choice |
| Package manager | pnpm | Choice |
| UI components | HeroUI v3 | Given |
| Styling | Tailwind CSS v4 | Required by HeroUI v3 |
| Font | IBM Plex Sans (`@fontsource-variable/ibm-plex-sans`, self-hosted) | Choice |
| Icons | lucide-react | Choice |
| Server state | TanStack Query v5 | Given |
| Routing | react-router v8 (data mode) | Given |
| Forms / validation | No library: `useState` + pure functions in `domain/` | Choice |
| Client state | Zustand (with `persist`) | Given |
| i18n | react-intl (FormatJS) | Provisional (D1) |
| API mocking | MSW v3 | Provisional (A10) |
| Tests | Vitest, React Testing Library, user-event, jsdom | Choice |
| Code quality | ESLint (typescript-eslint, react-hooks, @tanstack/eslint-plugin-query, simple-import-sort) + Prettier | Choice |

---

## Reasons

### React 19 + TypeScript + Vite
- HeroUI v3 requires React 19.
- TypeScript in `strict` mode is given. It is also the main safeguard for money amounts.
- Vite is the standard for client-only applications: a fast dev server, and Vitest uses the same configuration. The
  task needs no server rendering, so there is no Next.js and no react-router framework mode.
- The build splits the libraries into three chunks (React with the router, HeroUI with React Aria, the rest), so they
  stay cached when only the app changes. The app itself is about 55 kB, so the routes are not loaded lazily: both pages
  need the same libraries, and splitting them would add a request without saving any.

### pnpm
- Fast, with strict dependency resolution: undeclared packages cannot be imported. `pnpm-lock.yaml` pins the exact
  versions, and it installs unchanged with pnpm 10.
- `devEngines` asks for pnpm 10+ and only warns, `engines` for Node.js 22.22+, the lowest version all dependencies
  support. There is no `packageManager` field: with it, pnpm would download that exact version through the registry
  on its own, which not every network allows.
- `pnpm-workspace.yaml` allows msw 3 for `@vitest/mocker`, which still names msw 2 as its peer. It only uses msw for
  Vitest's browser mode, which this project does not use.

### HeroUI v3 + Tailwind CSS v4 *(given)*
- Built on **React Aria Components**. Accessibility, keyboard support and focus management (combobox, modal) come with
  it.
- The components this task needs are available:

| Component | Use |
|---|---|
| `NumberField` | Fees. Parses input in the active locale, a number without symbol, the currency as `InputGroup.Suffix`, `minValue={0}`. |
| `ComboBox` | Invoice search (bonus: autocomplete). `allowsCustomValue` for typing a number. The classic combobox is `ComboBox`, not the v3 component `Autocomplete`. |
| `Modal` / `AlertDialog` | Confirmation step (bonus) |
| `Toast` | Success message |
| `Alert`, `FieldError` | Warnings and error messages |
| `Card`, `Skeleton` | Layout and loading states |

- Known pitfalls:
  - `NumberField` returns a float and `NaN` for an empty field. The conversion to cents therefore happens right at the
    field.
  - For server-side search the ComboBox's built-in client filter must be off. `items` and `inputValue` are therefore
    controlled from outside (`components/search/SearchField`).
  - React Aria's built-in validation is **not** used. The components only get `isInvalid` and the message from our own
    validation (see form state). Exception: `minValue={0}` on the `NumberField` prevents negative input altogether.
- Tailwind v4 is configured in CSS (`@import "tailwindcss"`). There is no `tailwind.config.js` anymore.

### TanStack Query v5 *(given)*
- Manages server data: the payment, the searches, submitting the assignment.
- Searches use query keys such as `['invoices', 'search', { q, customerId }]` with a debounced search text,
  `placeholderData: keepPreviousData` and `signal` for cancellation, so an outdated response cannot overwrite a newer
  one.
- The assignment runs through `useMutation`:
  - `isPending` locks the confirm button against double submission.
  - Components below the hook only see `AssignmentSubmission` (`isPending`, `error`, `submit`, `reset`), not the
    mutation object, so they do not depend on TanStack Query.
  - On success the payment is marked as assigned in the cache, the payment searches are dropped and the invoices are
    invalidated. Then the payment selection opens.

### react-router v8, data mode *(given)*
- Used with `createBrowserRouter` instead of `<BrowserRouter>`, because only then do the routes' error pages
  (**`errorElement`**) work.
- Data is **not** loaded through `loader`, only through TanStack Query. That keeps a single cache and no duplicate data.
- HeroUI components (React Aria) navigate through `RouterProvider` from `@heroui/react` in the root route
  (`RouterLinkProvider`), connected to `useNavigate` and `useHref`. Links with `href` therefore do not reload the page.
  `routerOptions` is typed by augmenting `react-aria-components` (`routerConfig.d.ts`), which is why the package is a
  direct dependency.
- Routes: `/payments` (step 1, choose a payment) and `/payments/:paymentId/assign` (chosen payment, steps 2 and 3). Both
  show the same process. The confirmation step is a modal, not a route of its own, so the input survives a reload of the
  dialog's page state.
- Only `pages/` navigate. Features report what happened through callbacks (`onSelect`, `onChangePayment`, `onAssigned`),
  so they do not depend on paths. Navigation state is the typed `SelectPaymentReason` and is checked with
  `selectPaymentReason`, because `location.state` is untyped and survives in the browser history.

### Form state without a library *(choice)*

**Decision:** `useState` in custom hooks, calculation and validation as pure functions. TanStack Form with zod was the
original plan.

| Criterion | No library | TanStack Form + zod | React Hook Form |
|---|---|---|---|
| Fits React Aria (fields are controlled) | ✅ | ✅ out of the box | ⚠️ every field needs a `Controller` |
| Cross-field validation (fees ≤ amount, sum = amount) | ✅ one pure function | ✅ form-level validator | ⚠️ `superRefine` + manual `trigger()` |
| States such as "touched", "submitting" | ⚠️ built by hand (a `Set`, the mutation's `isPending`) | ✅ | ✅ |
| Additional dependencies | ✅ none | ❌ two | ❌ one or two |

- **Why no library:** the form has one invoice field and four amounts. The `NumberField` does type checking and
  parsing, so the amounts already arrive as cents. Two cross-field rules remain. That is not worth two libraries, and
  calculation and validation stay testable without React.
- **Why not React Hook Form:** its strength is reading values straight from native inputs. That strength is lost
  because the HeroUI components have to be controlled.
- **Implementation:**
  - `domain/split.ts` holds the draft (`SplitDraft`) and `evaluateSplit`, which returns calculation and validation
    together. Validation returns error codes with amounts, the components turn them into ICU messages.
  - `domain/money.ts` holds the entered amount (`AmountInput`: cents, `null` for an empty field, or `{ tooPrecise }`),
    the upper limit and the conversion between euros and cents. `lib/stripCurrency.ts` cleans pasted text, and the
    formatting hooks are in `lib/useFormatMoney.ts`, so `domain/` imports no React.
  - `useSplitDraft` holds the draft and the touched fields, calls `evaluateSplit` once per render and offers setters
    with updater functions.
  - `useAssignmentFlow` combines the chosen invoice, the split draft, the open dialog and the submission.
    `PaymentAssignment` only renders it, so the fee splitter and the confirmation dialog show the same values. The page
    itself only loads the payment.
  - Only what the user enters is stored. The suggested merchant payout is calculated on every render; the only state is
    an override (`merchantOverride`, A1).
  - `components/MoneyField` binds the `NumberField` to cents once (`null` for an empty field). It does not round more
    than two decimals but passes them on as `{ tooPrecise: euros }`, so no amount other than the typed one is taken.
  - Missing input is shown when a field is left, not on every keystroke. Which fields were left is kept by
    `useSplitDraft`. Pressing the confirm button with input missing shows every error at its field and focuses the first
    one, instead of disabling the button. The sum is only checked once every field is valid.

### Zustand + `persist` *(given)*
- Every kind of state has exactly one place:
  - Server data → TanStack Query
  - Form values → `useState` in `useAssignmentFlow` and `useSplitDraft`, calculation and validation as pure functions in
    `domain/`
  - App-wide client state (the language) → Zustand
  - State only one component needs (the open confirmation dialog) → `useState`
- One store per topic, next to the code that uses it. The only one is `i18n/localeStore.ts`: the language, starting from
  the browser language, with the user's choice stored.
- `persist` writes to `localStorage`. `partialize` decides what is stored. `merge` only takes valid values, so a stale or
  hand-edited entry cannot put the app into an invalid state. If `localStorage` is blocked (private mode), the app keeps
  running without storing.
- Components read with selectors (`useLocaleStore((s) => s.locale)`), so they only re-render when that value changes.
- Server data does **not** go into Zustand, otherwise it would exist twice next to the query cache.

### react-intl (FormatJS) *(provisional)*
- Messages live in `de.json` and `en.json`. Keys are flat and structured by dots. Placeholders follow ICU syntax
  (`{amount}`).
- Amounts are shown with `intl.formatNumber(cents / 100, { style: 'currency', currency })`. The `NumberField` shows the
  number with the same separators and the currency symbol as a suffix.
- **One locale source** for `IntlProvider` (react-intl) and `I18nProvider` (React Aria) (D1).
- Message ids are typed: through the global FormatJS types (`FormatjsIntl.Message`) the keys of `en.json` are the only
  allowed ids. An unknown id in `<FormattedMessage>` or `formatMessage` fails the typecheck.
- A key missing in `de.json` fails the typecheck (`satisfies`).

### MSW v3 *(provisional)*
- Intercepts `fetch` at the network level. The app logic stays the same when a real API is connected later.
- The same handlers run in the browser (service worker) and in Vitest (`setupServer`).
- Latency and failures can be controlled through URL parameters (see `ui/README.md`, "Scenarios").
- The Vite plugin `msw/vite` serves the service worker in the dev server. It runs in `worker-only` mode, so the stable
  `setupWorker` API is used instead of the experimental `virtual:msw`. There is therefore no generated
  `public/mockServiceWorker.js`. `pnpm build` contains neither worker nor handlers; only `--mode demo` copies the worker
  into the build.

### Vitest
- Vitest uses the Vite configuration, so no separate build setup is needed. Its API is compatible with Jest.
- Unit tests run in Node. The component test opts into jsdom per file and runs against the MSW handlers via
  `setupServer` (React Testing Library, user-event). What is covered: README, "Known limitations".

### ESLint + Prettier
- `typescript-eslint` with the strictest type-aware rule sets (`strictTypeChecked` + `stylisticTypeChecked`).
- `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (checks that hot reload in Vite works) and
  `@tanstack/eslint-plugin-query`. The latter detects incomplete query keys.
- `eslint-plugin-simple-import-sort` fixes the order of imports: packages first, then relative imports, each
  alphabetical. `pnpm lint:fix` sorts automatically.
- Prettier only formats, ESLint only checks rules. `eslint-config-prettier` turns off every ESLint rule that would clash
  with Prettier.

---

## Architecture trade-offs

- `domain/` uses the API types from `api/types.ts` (`Money`, `Invoice`, `SplitType`) directly instead of its own
  models. At this size a mapping layer would only copy the same shapes. If the API and the domain drift apart, `domain/`
  gets its own types and `api/` maps to them.

## Deliberately not used

| Library | Reason |
|---|---|
| Redux / RTK | Unnecessary: server state is in Query, form state is local |
| TanStack Form, zod, React Hook Form | Too much for one invoice field and four amounts, see form state |
| Formik | Hardly maintained anymore, weak typing |
| dinero.js / big.js | Only addition and subtraction of whole cents (A8). A small module of our own is enough. Re-evaluate for percentage fees or several currencies. |
| axios | `fetch` is enough, and MSW intercepts it directly |
| date-fns / dayjs | Dates are shown through `Intl` and react-intl (`formatDate`) |
| Lodash (e.g. `debounce`) | A small `useDebouncedValue` hook is enough |
