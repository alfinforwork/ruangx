'use client'

import { useEffect, useState } from 'react'
import { usePostStore, useAuthStore } from '@/presentation/store'
import { createPost, getTrendingTags } from '@/infrastructure/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  const { feed, trendingTags, loadFeed } = usePostStore()
  const user = useAuthStore(s => s.user)
  const [content, setContent] = useState('')

  useEffect(() => { loadFeed(); getTrendingTags().then(() => {}).catch(() => {}) }, [loadFeed])

  const handlePost = async () => {
    if (!content.trim()) return
    await createPost({ content })
    setContent('')
    loadFeed()
  }

  return (
    <div className="space-y-4">
      {/* Create post */}
      {user && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2">
              <Input placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)} />
              <Button onClick={handlePost} disabled={!content.trim()}>Post</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending tags */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-sm font-semibold">🔥 Trending:</span>
        {trendingTags.slice(0, 10).map(tag => (
          <span key={tag} className="text-sm text-primary">#{tag}</span>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {feed.map(post => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {post.user?.name?.[0] || '?'}
                  </div>
                  <span className="font-semibold text-sm">{post.user?.name || 'Unknown'}</span>
                </div>
                <p>{post.content}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>❤️ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                  <span>🔁 {post.shareCount}</span>
                  <span>👁️ {post.viewCount}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}