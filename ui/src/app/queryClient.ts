import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '../api/client.ts'

/** One retry, but not for a 4xx response, which will not succeed on retry. */
function shouldRetry(failureCount: number, error: Error) {
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500
  return !isClientError && failureCount < 1
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
  },
})
