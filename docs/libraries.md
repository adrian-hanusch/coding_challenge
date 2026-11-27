# Libraries

HeroUI v3, TanStack Query, react-router and Zustand were **given**. Everything else is our own choice.

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
| i18n | react-intl | Amount input and messages depend on the locale (D1) |
| API mocking | MSW v3 | No backend exists (A10) |
| Tests | Vitest, Testing Library, user-event, jsdom | |
| Code quality | ESLint (`strictTypeChecked`), Prettier | |
| Other | lucide-react, IBM Plex Sans (self-hosted) | |

## Notable choices

- **No form library.** One invoice field and four amounts. The `NumberField` already parses the locale and delivers
  numbers, so what remains are two cross-field rules (fees ≤ payment, sum = payment). They live as pure, tested
  functions in `domain/split.ts`; TanStack Form + zod or React Hook Form would add dependencies for little. React Hook
  Form would also need a `Controller` for every field, because React Aria fields are controlled.
- **One place per kind of state.** Server data in TanStack Query, form values in `useState`
  (`useAssignmentFlow`, `useSplitDraft`), the language in Zustand. Server data never goes into Zustand.
- **Data mode without loaders.** `createBrowserRouter` is used for `errorElement`; data is loaded only through
  TanStack Query, so there is one cache. Only `pages/` navigate; features report through callbacks.
- **HeroUI pitfalls.** `NumberField` returns a float (`NaN` when empty), so it is converted to cents right at the field
  (`MoneyField`). The ComboBox's client filter is off for server-side search (`SearchField`). React Aria's own
  validation is not used; fields get `isInvalid` and the message from our validation.
- **Typed messages.** The keys of `en.json` are the only valid message ids, and a key missing in `de.json` fails the
  typecheck.
- **MSW** intercepts `fetch`, so the app code is the same as with a real API. The same handlers run in the browser and
  in Vitest. `msw/vite` serves the worker in dev only (`worker-only` mode); `pnpm build` contains no mock, only
  `--mode demo` does.
- **pnpm** asks for 10+ and Node.js 22.22+ and only warns. There is no `packageManager` field, which would make pnpm
  download that exact version through the registry. `pnpm-workspace.yaml` allows msw 3 as a peer of `@vitest/mocker`,
  which needs msw only for Vitest's unused browser mode.
- **Bundling.** Libraries are split into three chunks that stay cached across deploys. The app is about 55 kB, so the
  routes are not lazy-loaded.
- **No separate domain types.** `domain/` uses the API types directly; a mapping layer would only copy them.

## Deliberately not used

| Library | Reason |
|---|---|
| Redux / RTK | Server state is in Query, form state is local |
| TanStack Form, zod, React Hook Form, Formik | Too much for five fields, see above |
| dinero.js / big.js | Only addition and subtraction of whole cents (A8) |
| axios, date-fns, Lodash | `fetch`, `Intl` and a small `useDebouncedValue` hook are enough |
