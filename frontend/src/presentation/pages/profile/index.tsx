'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, usePostStore } from '@/presentation/store'
import { getProfile } from '@/infrastructure/api'
import type { User } from '@/core/domain/entities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Tab = 'posts' | 'replies' | 'media' | 'likes' | 'shares' | 'bookmarks'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const { feed } = usePostStore()
  const [tab, setTab] = useState<Tab>('posts')

  if (!user) return <p>Loading...</p>

  const tabs: Tab[] = ['posts', 'replies', 'media', 'likes', 'shares', 'bookmarks']

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg" />

      {/* Avatar + Info */}
      <div className="flex items-end gap-4 -mt-12 px-4">
        <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-background">
          {user.name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Link href="/profile/settings">
          <Button variant="outline" size="sm">Settings</Button>
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto border-b pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded-t capitalize ${tab === t ? 'bg-muted font-semibold border-b-2 border-primary' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {tab === 'posts' && feed.map(post => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <Card className="hover:bg-muted/50 cursor-pointer">
              <CardContent className="pt-4">
                <p>{post.content}</p>
                <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                  <span>❤️ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {tab !== 'posts' && <p className="text-muted-foreground text-sm">No {tab} yet</p>}
      </div>
    </div>
  )
}