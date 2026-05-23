// ─── Domain Entities ───

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  bannerUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  content: string
  mediaUrls: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  parentId: string | null
  content: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  readAt: string | null
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'comment'
  referenceId: string
  message: string
  read: boolean
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PostCreateRequest {
  content: string
  mediaUrls?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}