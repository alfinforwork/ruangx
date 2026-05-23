'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPost, getComments, addComment, likePost, unlikePost, bookmarkPost, unbookmarkPost } from '@/infrastructure/api'
import type { Post, Comment } from '@/core/domain/entities'
import { useAuthStore } from '@/presentation/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore(s => s.user)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    getPost(id).then(setPost)
    getComments(id).then(setComments)
  }, [id])

  const toggleLike = async () => {
    if (!post) return
    if (post.isLiked) { await unlikePost(post.id); setPost({ ...post, isLiked: false, likeCount: post.likeCount - 1 }) }
    else { await likePost(post.id); setPost({ ...post, isLiked: true, likeCount: post.likeCount + 1 }) }
  }

  const toggleBookmark = async () => {
    if (!post) return
    if (post.isBookmarked) { await unbookmarkPost(post.id); setPost({ ...post, isBookmarked: false }) }
    else { await bookmarkPost(post.id); setPost({ ...post, isBookmarked: true }) }
  }

  const handleComment = async () => {
    if (!commentText.trim() || !post) return
    const c = await addComment(post.id, commentText)
    setComments(prev => [...prev, c])
    setCommentText('')
  }

  if (!post) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
              {post.user?.name?.[0] || '?'}
            </div>
            <div>
              <p className="font-semibold">{post.user?.name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-lg">{post.content}</p>
          {post.mediaUrls?.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {post.mediaUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-48 h-48 object-cover rounded" />
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">👁️ {post.viewCount} views</p>

          <div className="flex gap-4 mt-4 text-lg">
            <button onClick={toggleLike} className={post.isLiked ? 'text-red-500' : ''}>❤️ {post.likeCount}</button>
            <button>💬 {post.commentCount}</button>
            <button>🔁 {post.shareCount}</button>
            <button onClick={toggleBookmark} className={post.isBookmarked ? 'text-blue-500' : ''}>🔖</button>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-3">
        <h3 className="font-bold">Comments</h3>
        {user && (
          <div className="flex gap-2">
            <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." />
            <Button onClick={handleComment}>Post</Button>
          </div>
        )}
        {comments.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                  {c.user?.name?.[0] || '?'}
                </div>
                <span className="font-semibold text-sm">{c.user?.name || 'Unknown'}</span>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-sm">{c.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}