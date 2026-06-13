import { useState, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useComposerStore } from '@/stores/composer'
import { useCreatePost } from '@/hooks/post/use-post'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Image, X } from 'lucide-react'

const MAX_CHARS = 280

export function PostComposer({ inline = true }: { inline?: boolean }) {
  const user = useAuthStore((s) => s.user)
  const { draft, replyTo, setDraft, close } = useComposerStore()
  const createPost = useCreatePost()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mediaFiles, setMediaFiles] = useState<{ id: string; url: string }[]>([])

  const charCount = draft.length
  const isOverLimit = charCount > MAX_CHARS
  const isValid = charCount > 0 && !isOverLimit

  const handleSubmit = async () => {
    if (!isValid) return
    await createPost.mutateAsync({
      content: draft,
      parentId: replyTo?.postId,
      rootId: replyTo?.postId,
      mediaIds: mediaFiles.map((m) => m.id),
    })
    setDraft('')
    setMediaFiles([])
    close()
  }

  if (!user) return null

  return (
    <div className="border-b border-surface-800 p-4">
      {replyTo && (
        <p className="mb-2 text-xs text-gray-500">
          Membalas @{replyTo.username}
        </p>
      )}
      <div className="flex gap-3">
        <Avatar src={user.avatarUrl} alt={user.displayName} size="md" />
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Apa yang sedang terjadi?"
            className="w-full resize-none bg-transparent text-base text-white placeholder:text-gray-500 focus:outline-none min-h-[60px]"
            rows={Math.max(2, Math.ceil(draft.length / 60))}
          />

          {/* Media preview */}
          {mediaFiles.length > 0 && (
            <div className="mb-3 flex gap-2">
              {mediaFiles.map((m) => (
                <div key={m.id} className="relative">
                  <img
                    src={m.url}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    onClick={() =>
                      setMediaFiles((prev) =>
                        prev.filter((f) => f.id !== m.id),
                      )
                    }
                    className="absolute -right-2 -top-2 rounded-full bg-surface-900 p-0.5 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full p-2 text-brand-500 hover:bg-brand-600/20 transition-colors"
              >
                <Image className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={(e) => {
                  // Media upload handled externally
                  const files = e.target.files
                  // Placeholder — upload via upload API
                  e.target.value = ''
                }}
              />
              <span
                className={`text-xs ${
                  isOverLimit ? 'text-red-400' : 'text-gray-500'
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft('')
                  close()
                }}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                loading={createPost.isPending}
                disabled={!isValid}
              >
                Kirim
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ComposerModal() {
  const isOpen = useComposerStore((s) => s.isOpen)
  const close = useComposerStore((s) => s.close)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl border border-surface-800 bg-surface-900">
        <PostComposer inline={false} />
        <div className="flex justify-end p-3 pt-0">
          <Button variant="ghost" size="sm" onClick={close}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  )
}