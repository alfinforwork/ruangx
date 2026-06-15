import type { Post, User, PostMedia, CursorResponse } from '@/types/api'

// The backend post/user payloads are leaner than the frontend domain types
// (e.g. `user` vs `author`, `content_plain` vs `content`, omitted arrays).
// These normalizers bridge that gap in one place so components can rely on a
// stable shape.

export function normalizeUser(u: any): User {
  return {
    id: u?.id ?? '',
    username: u?.username ?? '',
    displayName: u?.displayName || u?.username || '',
    bio: u?.bio || null,
    avatarUrl: u?.avatarUrl || null,
    bannerUrl: u?.bannerUrl || null,
    website: u?.website || null,
    location: u?.location || null,
    isVerified: !!u?.isVerified,
    isPrivate: !!u?.isPrivate,
    followerCount: u?.followerCount ?? 0,
    followingCount: u?.followingCount ?? 0,
    postCount: u?.postCount ?? 0,
    createdAt: u?.createdAt || new Date().toISOString(),
    updatedAt: u?.updatedAt || u?.createdAt || new Date().toISOString(),
    isFollowing: u?.isFollowing,
    isFollowedBy: u?.isFollowedBy,
  }
}

function normalizeMedia(m: any): PostMedia {
  return {
    id: m?.id ?? '',
    url: m?.url ?? '',
    thumbnailUrl: m?.thumbnailUrl || undefined,
    type: (m?.type || m?.mediaType || 'image') as PostMedia['type'],
    width: m?.width ?? 0,
    height: m?.height ?? 0,
    alt: m?.altText || m?.alt || undefined,
  }
}

export function normalizePost(p: any): Post {
  return {
    id: p?.id ?? '',
    content: p?.content || p?.contentPlain || '',
    author: normalizeUser(p?.author ?? p?.user ?? {}),
    media: Array.isArray(p?.media) ? p.media.map(normalizeMedia) : [],
    parentId: p?.parentId ?? null,
    rootId: p?.rootId ?? p?.threadId ?? null,
    replyCount: p?.replyCount ?? 0,
    repostCount: p?.repostCount ?? 0,
    likeCount: p?.likeCount ?? 0,
    bookmarkCount: p?.bookmarkCount ?? 0,
    viewCount: p?.viewCount ?? 0,
    isLiked: !!p?.isLiked,
    isReposted: !!p?.isReposted,
    isBookmarked: !!p?.isBookmarked,
    isPinned: !!p?.isPinned,
    isSensitive: !!p?.isSensitive,
    createdAt: p?.createdAt || new Date().toISOString(),
    updatedAt: p?.updatedAt || p?.createdAt || new Date().toISOString(),
    hashtags: Array.isArray(p?.hashtags) ? p.hashtags : [],
    mentions: Array.isArray(p?.mentions) ? p.mentions : [],
  }
}

export function normalizePostPage(res: any): CursorResponse<Post> {
  const data = Array.isArray(res?.data) ? res.data : []
  return {
    data: data.map(normalizePost),
    meta: {
      cursor: res?.meta?.cursor ?? null,
      hasMore: res?.meta?.hasMore ?? false,
    },
  }
}
