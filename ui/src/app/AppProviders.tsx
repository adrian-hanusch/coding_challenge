import { Toast } from '@heroui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { LocaleProvider } from '../i18n/LocaleProvider.tsx'
import { queryClient } from '../lib/queryClient.ts'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <Toast.Provider />
        {children}
      </LocaleProvider>
      {/* Renders nothing in production builds. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
