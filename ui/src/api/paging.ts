import { infiniteQueryOptions, type QueryKey } from '@tanstack/react-query'

import type { Page } from './types.ts'

type FetchPage<T> = (offset: number, signal: AbortSignal) => Promise<Page<T>>

export function pagedSearchOptions<T>(queryKey: QueryKey, fetchPage: FetchPage<T>) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => {
      const next = last.offset + last.items.length
      return next < last.total ? next : undefined
    },
  })
}

export type PagedSearchOptions<T> = ReturnType<typeof pagedSearchOptions<T>>
