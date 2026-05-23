'use client'

import { api, ApiError } from '@/infrastructure/api/client'
import type {
  AuthResponse, LoginRequest, RegisterRequest, User,
  Post, PaginatedResponse, PostCreateRequest, Comment, Notification, Message,
} from '@/core/domain/entities'

// ─── Auth ───

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', req)
  api.setToken(res.token)
  return res
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/register', req)
  api.setToken(res.token)
  return res
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email })
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ruangx_token')
}

export function setToken(token: string | null) {
  api.setToken(token)
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('ruangx_token', token)
    else localStorage.removeItem('ruangx_token')
  }
}

// restore token on client
try { const t = getToken(); if (t) setToken(t) } catch {}

// ─── Posts ───

export async function createPost(req: PostCreateRequest): Promise<Post> {
  return api.post<Post>('/api/posts', req)
}

export async function getFeed(page = 1): Promise<PaginatedResponse<Post>> {
  return api.get<PaginatedResponse<Post>>(`/api/posts?page=${page}`)
}

export async function getPost(id: string): Promise<Post> {
  return api.get<Post>(`/api/posts/${id}`)
}

export async function likePost(id: string) { await api.post(`/api/posts/${id}/like`) }
export async function unlikePost(id: string) { await api.delete(`/api/posts/${id}/like`) }
export async function bookmarkPost(id: string) { await api.post(`/api/posts/${id}/bookmark`) }
export async function unbookmarkPost(id: string) { await api.delete(`/api/posts/${id}/bookmark`) }

export async function getComments(postId: string): Promise<Comment[]> {
  return api.get<Comment[]>(`/api/posts/${postId}/comments`)
}

export async function addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
  return api.post<Comment>(`/api/posts/${postId}/comments`, { content, parentId })
}

export async function getTrendingTags(): Promise<string[]> {
  return api.get<string[]>('/api/trending')
}

// ─── Chat ───

export async function getConversations(): Promise<User[]> {
  return api.get<User[]>('/api/chat/conversations')
}

export async function getMessages(userId: string): Promise<Message[]> {
  return api.get<Message[]>(`/api/chat/messages/${userId}`)
}

export async function sendMessage(receiverId: string, content: string): Promise<Message> {
  return api.post<Message>('/api/chat/messages', { receiverId, content })
}

// ─── Notifications ───

export async function getNotifications(): Promise<Notification[]> {
  return api.get<Notification[]>('/api/notifications')
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/api/notifications/${id}/read`)
}

// ─── Profile ───

export async function getProfile(userId: string): Promise<User> {
  return api.get<User>(`/api/users/${userId}`)
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return api.put<User>('/api/users/me', data)
}

export async function changePassword(current: string, newPassword: string): Promise<void> {
  await api.put('/api/users/me/password', { current, newPassword })
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  return api.get<Post[]>(`/api/users/${userId}/posts`)
}

export async function getUserBookmarks(): Promise<Post[]> {
  return api.get<Post[]>('/api/users/me/bookmarks')
}

export async function getUserReplies(userId: string): Promise<Comment[]> {
  return api.get<Comment[]>(`/api/users/${userId}/replies`)
}

export async function getUserLikes(userId: string): Promise<Post[]> {
  return api.get<Post[]>(`/api/users/${userId}/likes`)
}

export async function getRecommendations(): Promise<User[]> {
  return api.get<User[]>('/api/users/recommendations')
}

export { ApiError }