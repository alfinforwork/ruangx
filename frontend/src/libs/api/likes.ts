import { api } from './client'

export const likesApi = {
  toggle: (postId: string) =>
    api<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, { method: 'POST' }),
}