// ── Domain Types ──

export interface User {
  id: string
  username: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  website: string | null
  location: string | null
  isVerified: boolean
  isPrivate: boolean
  followerCount: number
  followingCount: number
  postCount: number
  createdAt: string
  updatedAt: string
  isFollowing?: boolean
  isFollowedBy?: boolean
}

export interface PostMedia {
  id: string
  url: string
  thumbnailUrl?: string
  type: 'image' | 'video' | 'gif'
  width: number
  height: number
  alt?: string
}

export interface Post {
  id: string
  content: string
  author: User
  media: PostMedia[]
  parentId: string | null
  rootId: string | null
  replyCount: number
  repostCount: number
  likeCount: number
  bookmarkCount: number
  viewCount: number
  isLiked: boolean
  isReposted: boolean
  isBookmarked: boolean
  isPinned: boolean
  isSensitive: boolean
  createdAt: string
  updatedAt: string
  hashtags: string[]
  mentions: string[]
}

export interface Room {
  id: string
  name: string
  description: string | null
  icon: string | null
  bannerUrl: string | null
  memberCount: number
  postCount: number
  isPrivate: boolean
  isJoined: boolean
  createdAt: string
  owner?: User
  moderators?: User[]
}

export interface Hashtag {
  id: string
  tag: string
  postCount: number
  isTrending: boolean
  trendingRank: number | null
}

export interface Notification {
  id: string
  type: NotificationType
  actor: User
  postId: string | null
  postContent: string | null
  read: boolean
  createdAt: string
}

export type NotificationType =
  | 'like'
  | 'repost'
  | 'follow'
  | 'reply'
  | 'mention'
  | 'quote'

export interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message | null
  unreadCount: number
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  sender: User
  content: string
  createdAt: string
}

export interface Trend {
  id: string
  name: string
  postCount: number
  category: string | null
  rank: number
}

export interface FeedPost extends Post {
  feedRank: number
}

// ── API DTOs ──

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface CursorResponse<T> {
  data: T[]
  meta: {
    cursor: string | null
    hasMore: boolean
  }
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  identifier: string // username or email
  password: string
}

export interface RegisterRequest {
  username: string
  displayName: string
  email: string
  password: string
}

export interface CreatePostRequest {
  content: string
  mediaIds?: string[]
  parentId?: string
  rootId?: string
  isSensitive?: boolean
}

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  website?: string
  location?: string
  isPrivate?: boolean
}

export interface SendMessageRequest {
  conversationId?: string
  recipientId?: string
  content: string
}

export interface CreateRoomRequest {
  name: string
  description?: string
  icon?: string
  isPrivate?: boolean
}

export interface UploadResponse {
  id: string
  url: string
  thumbnailUrl?: string
  type: 'image' | 'video' | 'gif'
  width: number
  height: number
}

// ── Query Params ──

export interface TimelineParams {
  type?: 'for_you' | 'following'
  cursor?: string
  limit?: number
}

export interface PostListParams {
  userId?: string
  cursor?: string
  limit?: number
  type?: 'posts' | 'replies' | 'likes' | 'media'
}

export interface SearchParams {
  q: string
  type?: 'posts' | 'users' | 'hashtags'
  cursor?: string
  limit?: number
}