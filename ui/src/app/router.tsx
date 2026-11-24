import { createBrowserRouter, Navigate } from 'react-router'

import { AssignPaymentPage } from '../pages/AssignPaymentPage.tsx'
import { NotFoundPage } from '../pages/NotFoundPage.tsx'
import { SelectPaymentPage } from '../pages/SelectPaymentPage.tsx'
import { PATHS } from './paths.ts'
import { RouteError } from './RouteError.tsx'
import { RouterLinkProvider } from './RouterLinkProvider.tsx'
import { AppShell } from './shell/AppShell.tsx'

// Data mode (`createBrowserRouter`) is required for `errorElement`.
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
              { index: true, element: <Navigate to={PATHS.selectPayment} replace /> },
              { path: PATHS.selectPayment, element: <SelectPaymentPage /> },
              { path: PATHS.assignPayment, element: <AssignPaymentPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
