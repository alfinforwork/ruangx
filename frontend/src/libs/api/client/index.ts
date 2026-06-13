/// <reference types="vite/client" />

import { ofetch, type FetchOptions } from 'ofetch'
import { useAuthStore } from '@/stores/auth'

export const api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
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
  onResponseError({ response }) {
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