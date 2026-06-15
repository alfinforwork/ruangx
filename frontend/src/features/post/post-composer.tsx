import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useComposerStore } from '@/stores/composer'
import { useCreatePost } from '@/hooks/post/use-post'
import { Avatar } from '@/components/ui/avatar'
import { BadgeCheck, Globe, Image as ImageIcon, ListOrdered, Smile } from 'lucide-react'

const MAX_CHARS = 500

const EMOJIS = [
  '😊', '😂', '🥰', '😍', '🤩', '😎', '🥺', '😭', '😅', '🤔',
  '😏', '🙃', '😤', '🥳', '😴', '👏', '🙌', '👍', '❤️', '🔥',
  '✨', '💯', '🎉', '🌟', '💜', '🙏', '💪', '🤝', '👀', '💀',
  '🤗', '😇', '🫶', '🫠', '🥹', '😶', '🤭', '🫡', '😬', '🙄',
  '🌈', '🌙', '⭐', '🌸', '🍃', '🌊', '🎵', '🎶', '📚', '💡',
]

export function ComposerModal() {
  const isOpen = useComposerStore((s) => s.isOpen)
  const replyTo = useComposerStore((s) => s.replyTo)
  const draft = useComposerStore((s) => s.draft)
  const setDraft = useComposerStore((s) => s.setDraft)
  const close = useComposerStore((s) => s.close)
  const user = useAuthStore((s) => s.user)
  const createPost = useCreatePost()
  const [emojiOpen, setEmojiOpen] = useState(false)

  if (!isOpen || !user) return null

  const isReply = !!replyTo
  const charCount = draft.length
  const isValid = charCount > 0 && charCount <= MAX_CHARS

  const handleSubmit = async () => {
    if (!isValid || createPost.isPending) return
    await createPost.mutateAsync({
      content: draft,
      parentId: replyTo?.postId,
      rootId: replyTo?.postId,
    })
    close()
  }

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[100] flex animate-rx-fade items-start justify-center bg-[#050509]/72 px-5 pb-5 pt-[8vh] backdrop-blur-[4px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] animate-rx-pop overflow-hidden rounded-[22px] border border-[#24242e] bg-modal shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e1e26] p-[16px_20px]">
          <button
            onClick={close}
            className="text-[15px] font-semibold text-muted-2 hover:text-ink"
          >
            Batal
          </button>
          <span className="text-[16px] font-bold">
            {isReply ? 'Balas Thread' : 'Buat Thread'}
          </span>
          <span className="w-11" />
        </div>

        {/* Original post (reply mode) */}
        {isReply && replyTo && (
          <div className="border-b border-line-row p-[18px_20px_6px]">
            <div className="flex gap-3">
              <div className="flex w-[42px] shrink-0 flex-col items-center">
                <Avatar
                  src={replyTo.avatarUrl}
                  alt={replyTo.displayName ?? replyTo.username}
                  seed={replyTo.username}
                  size="md"
                />
                <div className="my-1 min-h-7 w-0.5 flex-1 rounded bg-brand-500/30" />
              </div>
              <div className="flex-1 pb-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-[14.5px] font-bold text-ink-bright">
                    {replyTo.displayName ?? replyTo.username}
                  </span>
                  {replyTo.verified && <BadgeCheck className="h-3.5 w-3.5 fill-brand-500 text-modal" />}
                </div>
                {replyTo.content && (
                  <div className="line-clamp-4 text-[14.5px] leading-relaxed text-muted-4">
                    {replyTo.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="p-5">
          <div className="flex gap-3.5">
            <Avatar
              src={user.avatarUrl}
              alt={user.displayName}
              seed={user.username}
              size="lg"
            />
            <div className="flex-1">
              {isReply ? (
                <div className="mb-2 text-[13px] text-muted">
                  Membalas <span className="text-violet-soft">@{replyTo!.username}</span>
                </div>
              ) : (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[12.5px] font-bold text-violet-soft">
                  <Globe className="h-3 w-3" strokeWidth={2} />
                  Publik
                </span>
              )}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={isReply ? 'Tulis balasan kamu...' : 'Apa yang ada di pikiranmu?'}
                autoFocus
                className="min-h-[140px] w-full resize-none bg-transparent text-[18px] leading-relaxed text-ink outline-none placeholder:text-faint"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="relative">
            {emojiOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-[52px] left-0 z-20 w-[300px] rounded-2xl border border-line-strong bg-popover p-3 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
              >
                <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
                  Emoji
                </div>
                <div className="grid grid-cols-10 gap-0.5">
                  {EMOJIS.map((e, i) => (
                    <button
                      key={`${e}-${i}`}
                      onClick={() => {
                        setDraft(draft + e)
                        setEmojiOpen(false)
                      }}
                      className="rounded-lg p-1 text-xl leading-none hover:bg-brand-500/15"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#1e1e26] pt-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEmojiOpen((v) => !v)
                  }}
                  className="rounded-[10px] p-2 leading-none text-violet-soft hover:bg-brand-500/[0.12]"
                >
                  <Smile className="h-[21px] w-[21px]" strokeWidth={1.8} />
                </button>
                <button className="rounded-[10px] border border-brand-500/30 px-2 py-1.5 text-xs font-extrabold text-violet-soft hover:bg-brand-500/[0.12]">
                  GIF
                </button>
                <button className="rounded-[10px] p-2 leading-none text-violet-soft hover:bg-brand-500/[0.12]">
                  <ImageIcon className="h-[21px] w-[21px]" strokeWidth={1.8} />
                </button>
                <button className="rounded-[10px] p-2 leading-none text-violet-soft hover:bg-brand-500/[0.12]">
                  <ListOrdered className="h-[21px] w-[21px]" strokeWidth={1.8} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                {charCount > 0 && (
                  <span
                    className={`text-xs ${charCount > MAX_CHARS ? 'text-[#fb5a7e]' : 'text-muted'}`}
                  >
                    {charCount}/{MAX_CHARS}
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || createPost.isPending}
                  className="rounded-xl bg-grad-brand px-7 py-[11px] text-[15px] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {isReply ? 'Balas' : 'Posting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
