import type {
  User, Post, Comment, Message, Notification,
  LoginRequest, RegisterRequest, AuthResponse,
  PostCreateRequest, PaginatedResponse,
} from '@/core/domain/entities'

export interface AuthRepository {
  login(req: LoginRequest): Promise<AuthResponse>
  register(req: RegisterRequest): Promise<AuthResponse>
  forgotPassword(email: string): Promise<void>
  getMe(): Promise<User>
  updateProfile(data: Partial<User>): Promise<User>
  changePassword(current: string, newPassword: string): Promise<void>
}

export interface PostRepository {
  create(req: PostCreateRequest): Promise<Post>
  getFeed(page?: number): Promise<PaginatedResponse<Post>>
  getById(id: string): Promise<Post>
  like(id: string): Promise<void>
  unlike(id: string): Promise<void>
  bookmark(id: string): Promise<void>
  unbookmark(id: string): Promise<void>
  getComments(postId: string): Promise<Comment[]>
  addComment(postId: string, content: string, parentId?: string): Promise<Comment>
  getTrendingTags(): Promise<string[]>
}

export interface ChatRepository {
  getConversations(): Promise<User[]>
  getMessages(userId: string): Promise<Message[]>
  sendMessage(receiverId: string, content: string): Promise<Message>
}

export interface NotificationRepository {
  getAll(): Promise<Notification[]>
  markRead(id: string): Promise<void>
}

export interface UserRepository {
  getProfile(userId: string): Promise<User>
  getPosts(userId: string): Promise<Post[]>
  getReplies(userId: string): Promise<Comment[]>
  getMedia(userId: string): Promise<string[]>
  getLikes(userId: string): Promise<Post[]>
  getShares(userId: string): Promise<Post[]>
  getBookmarks(): Promise<Post[]>
  getRecommendations(): Promise<User[]>
}