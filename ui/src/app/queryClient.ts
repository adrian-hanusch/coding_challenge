import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '../api/client.ts'

const MAX_RETRIES = 1

/** A 4xx response will not succeed on retry. */
function shouldRetry(failureCount: number, error: Error) {
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500
  return !isClientError && failureCount < MAX_RETRIES
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
})
