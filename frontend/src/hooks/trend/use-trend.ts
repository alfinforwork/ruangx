import { useQuery } from '@tanstack/react-query'
import { trendsApi } from '@/libs/api/trends'
import { trendKeys } from '@/libs/query'

export function useTrends() {
  return useQuery({
    queryKey: trendKeys.list(),
    queryFn: trendsApi.list,
    staleTime: 5 * 60 * 1000,
  })
}