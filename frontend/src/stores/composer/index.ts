import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ReplyTarget {
  postId: string
  username: string
  displayName?: string
  content?: string
  avatarUrl?: string | null
  verified?: boolean
}

interface ComposerState {
  draft: string
  isOpen: boolean
  replyTo: ReplyTarget | null
  mediaIds: string[]
  setDraft: (draft: string) => void
  open: (replyTo?: ReplyTarget) => void
  close: () => void
  addMedia: (id: string) => void
  removeMedia: (id: string) => void
  clearMedia: () => void
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      draft: '',
      isOpen: false,
      replyTo: null,
      mediaIds: [],

      setDraft: (draft) => set({ draft }),
      open: (replyTo) => set({ isOpen: true, replyTo: replyTo ?? null, draft: '' }),
      close: () => set({ isOpen: false, replyTo: null, draft: '', mediaIds: [] }),
      addMedia: (id) => set((s) => ({ mediaIds: [...s.mediaIds, id] })),
      removeMedia: (id) => set((s) => ({ mediaIds: s.mediaIds.filter((m) => m !== id) })),
      clearMedia: () => set({ mediaIds: [] }),
    }),
    {
      name: 'ruangx-composer',
      // Only persist the draft so an accidental close doesn't lose text.
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
)
