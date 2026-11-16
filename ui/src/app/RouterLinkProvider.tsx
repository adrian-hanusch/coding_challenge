import { RouterProvider } from '@heroui/react'
import { useCallback } from 'react'
import { type NavigateOptions, Outlet, useHref, useNavigate } from 'react-router'

// Lets HeroUI links navigate through react-router. Sits above the shell, so error fallbacks get client-side links too.
export function RouterLinkProvider() {
  const navigate = useNavigate()
  const navigateTo = useCallback((path: string, options?: NavigateOptions) => void navigate(path, options), [navigate])

  return (
    <RouterProvider navigate={navigateTo} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  )
}
