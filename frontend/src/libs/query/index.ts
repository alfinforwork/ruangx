// ── Query Key Factories ──

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) => [...postKeys.lists(), filter] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  thread: (id: string) => [...postKeys.all, 'thread', id] as const,
}

export const feedKeys = {
  all: ['feed'] as const,
  list: (type: string, cursor?: string) => [...feedKeys.all, type, cursor] as const,
}

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) => [...userKeys.lists(), filter] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (username: string) => [...userKeys.details(), username] as const,
  posts: (username: string, type?: string) => [...userKeys.detail(username), 'posts', type] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
}

export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) => [...roomKeys.lists(), filter] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
}

export const hashtagKeys = {
  all: ['hashtags'] as const,
  trending: () => [...hashtagKeys.all, 'trending'] as const,
  detail: (tag: string) => [...hashtagKeys.all, 'detail', tag] as const,
  posts: (tag: string) => [...hashtagKeys.all, 'posts', tag] as const,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (cursor?: string) => [...notificationKeys.all, 'list', cursor] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messageKeys.all, 'conversation', id] as const,
}

export const trendKeys = {
  all: ['trends'] as const,
  list: () => [...trendKeys.all, 'list'] as const,
}

export const likeKeys = {
  all: ['likes'] as const,
  list: (postId: string) => [...likeKeys.all, 'list', postId] as const,
}

export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  list: () => [...bookmarkKeys.all, 'list'] as const,
}

export const followKeys = {
  all: ['follows'] as const,
  followers: (userId: string) => [...followKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...followKeys.all, 'following', userId] as const,
}