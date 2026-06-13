/// <reference types="vite/client" />

import { ofetch, type FetchOptions } from 'ofetch'
import { useAuthStore } from '@/stores/auth'

// ── JSON key case transformers (camelCase ↔ snake_case) ──

function toSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function toCamelCase(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function transformKeys(obj: unknown, transformer: (s: string) => string): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map((v) => transformKeys(v, transformer))
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[transformer(k)] = transformKeys(v, transformer)
    }
    return result
  }
  return obj
}

export const api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  onRequest({ options }) {
    // Convert request body from camelCase to snake_case
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.body = transformKeys(options.body, toSnakeCase) as Record<string, any>
    }
    // Attach auth token
    const token = useAuthStore.getState().accessToken
    if (token) {
      options.headers = {
        ...Object.fromEntries(
          options.headers instanceof Headers
            ? [...options.headers.entries()]
            : Object.entries(options.headers ?? {}),
        ),
        Authorization: `Bearer ${token}`,
      } as any
    }
  },
  onResponse({ response }) {
    // Convert response body from snake_case to camelCase
    if (response._data) {
      response._data = transformKeys(response._data, toCamelCase)
    }
    // Unwrap backend {success:true, data:...} envelope
    const d = response._data as any
    if (d && d.success && d.data !== undefined) {
      const inner = d.data
      // Remap paginated shape {items, cursor, hasMore, limit} → {data: items, meta: {cursor, hasMore}}
      if (inner && typeof inner === 'object' && !Array.isArray(inner) && 'items' in inner) {
        response._data = {
          data: inner.items ?? [],
          meta: {
            cursor: inner.cursor ?? null,
            hasMore: inner.hasMore ?? false,
            limit: inner.limit,
          },
        }
      } else {
        // Single-object response: just unwrap to inner data
        response._data = inner
      }
    }
  },
  onResponseError({ response }) {
    // Convert error body from snake_case to camelCase (idempotent if already transformed)
    if (response._data) {
      response._data = transformKeys(response._data, toCamelCase)
    }
    // Extract readable error from API response
    const data = response._data as any
    if (data?.error?.details && Array.isArray(data.error.details)) {
      const messages = data.error.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
      throw new Error(messages)
    }
    if (data?.error?.message) {
      throw new Error(data.error.message)
    }
    // 401 auto-logout
    if (response.status === 401) {
      const url = response.url ?? ''
      if (!url.endsWith('/auth/login') && !url.endsWith('/auth/refresh')) {
        useAuthStore.getState().logout()
      }
    }
  },
})

export const uploadApi = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  onRequest({ options }) {
    const token = useAuthStore.getState().accessToken
    if (token) {
      options.headers = {
        ...Object.fromEntries(
          options.headers instanceof Headers
            ? [...options.headers.entries()]
            : Object.entries(options.headers ?? {}),
        ),
        Authorization: `Bearer ${token}`,
      } as any
    }
  },
})

/** Typed wrapper */
export function apiGet<T>(url: string, opts?: FetchOptions<'json'>): Promise<T> {
  return api(url, { method: 'GET', ...opts })
}

export function apiPost<T>(url: string, opts?: FetchOptions<'json'>): Promise<T> {
  return api(url, { method: 'POST', ...opts })
}

export function apiPut<T>(url: string, opts?: FetchOptions<'json'>): Promise<T> {
  return api(url, { method: 'PUT', ...opts })
}

export function apiDelete<T>(url: string, opts?: FetchOptions<'json'>): Promise<T> {
  return api(url, { method: 'DELETE', ...opts })
}