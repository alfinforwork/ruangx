import { useState } from 'react'
import { PostComposer } from '@/features/post/post-composer'
import { PostList } from '@/features/post/post-list'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { timelineApi } from '@/libs/api/timeline'

export function FeedPage() {
  const [feedType, setFeedType] = useState('for_you')

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg">
        <h1 className="px-4 py-3 text-lg font-bold text-white">Beranda</h1>
        <Tabs value={feedType} onValueChange={setFeedType}>
          <TabsList className="w-full rounded-none bg-transparent p-0">
            <TabsTrigger
              value="for_you"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              Untukmu
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              Mengikuti
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Composer */}
      <PostComposer />

      {/* Feed */}
      <PostList
        queryKey={['feed', feedType]}
        queryFn={({ pageParam }) => timelineApi.get(feedType, pageParam)}
      />
    </div>
  )
}