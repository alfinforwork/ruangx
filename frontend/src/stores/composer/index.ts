import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ComposerState {
  draft: string
  isOpen: boolean
  replyTo: { postId: string; username: string } | null
  mediaIds: string[]
  setDraft: (draft: string) => void
  open: (replyTo?: { postId: string; username: string }) => void
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
      open: (replyTo) => set({ isOpen: true, replyTo: replyTo ?? null }),
      close: () => set({ isOpen: false, replyTo: null, draft: '', mediaIds: [] }),
      addMedia: (id) => set((s) => ({ mediaIds: [...s.mediaIds, id] })),
      removeMedia: (id) => set((s) => ({ mediaIds: s.mediaIds.filter((m) => m !== id) })),
      clearMedia: () => set({ mediaIds: [] }),
    }),
    {
      name: 'ruangx-composer',
      partialize: (state) => ({
        draft: state.draft,
        replyTo: state.replyTo,
        mediaIds: state.mediaIds,
      }),
    },
  ),
)