import type { Trend } from '@/types/api'
import { api } from './client'

export const trendsApi = {
  list: () =>
    api<Trend[]>('/trends'),
}