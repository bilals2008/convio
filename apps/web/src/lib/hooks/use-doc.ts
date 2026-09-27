import { useQuery } from '@tanstack/react-query'
import { getDoc } from '@/lib/docs/content'

/**
 * Docs live in the bundle as lazily imported markdown chunks, so reading one is an
 * async load. It never changes for a given slug, hence `staleTime: Infinity`.
 */
export function useDoc(slug: string) {
  return useQuery({
    queryKey: ['doc', slug],
    queryFn: () => getDoc(slug),
    enabled: slug !== '',
    staleTime: Infinity,
  })
}
