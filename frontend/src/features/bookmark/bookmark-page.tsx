import { useBookmarkList } from '@/hooks/bookmark/use-bookmark'
import { PostCard } from '@/features/post/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bookmark } from 'lucide-react'

export function BookmarkPage() {
  const { data, isLoading } = useBookmarkList()
  const posts = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      <div className="mb-4">
        <h1 className="text-[20px] font-extrabold tracking-[-0.3px]">Bookmark kamu</h1>
        <p className="mt-0.5 text-[13.5px] text-muted">Thread yang kamu simpan untuk dibaca nanti</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-line bg-card p-5">
              <div className="flex gap-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-card py-16 text-center text-muted">
          <Bookmark className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p className="text-[15px] font-semibold text-ink">Belum ada bookmark</p>
          <p className="mt-1 text-sm">Simpan thread dengan menekan ikon bookmark.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
