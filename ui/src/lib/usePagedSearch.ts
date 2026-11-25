import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { PagedSearchOptions } from '../api/paging.ts'
import { useDebouncedValue } from './useDebouncedValue.ts'

const SEARCH_DEBOUNCE_MS = 250

export function usePagedSearch<T>(query: string, optionsFor: (query: string) => PagedSearchOptions<T>) {
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const search = useInfiniteQuery({
    ...optionsFor(debouncedQuery),
    placeholderData: keepPreviousData,
    // No request for outdated text.
    enabled: debouncedQuery === query,
  })
  const { data, hasNextPage, isFetchingNextPage } = search
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return {
    items,
    isSearching: search.isFetching && !isFetchingNextPage,
    isLoadingMore: isFetchingNextPage,
    isError: search.isError,
    loadMore: () => {
      if (hasNextPage && !isFetchingNextPage) void search.fetchNextPage()
    },
    retry: () => void search.refetch(),
  }
}
