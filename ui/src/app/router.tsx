import { createBrowserRouter, Navigate } from 'react-router'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { PaymentsPage } from '../pages/PaymentsPage.tsx'
import { RouterLinkProvider } from './RouterLinkProvider.tsx'
import { PATHS } from './paths.ts'
import { RouteError } from './RouteError.tsx'
import { AppShell } from './shell/AppShell.tsx'

// Data mode (`createBrowserRouter`) is required for `useBlocker`, see docs/libraries.md.
export const router = createBrowserRouter([
  {
    element: <RouterLinkProvider />,
    children: [
      {
        element: <AppShell />,
        errorElement: <RouteError />,
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, element: <Navigate to={PATHS.payments} replace /> },
              { path: PATHS.payments, element: <PaymentsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
