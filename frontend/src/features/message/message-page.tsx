import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations, useMessages, useSendMessage } from '@/hooks/message/use-message'
import { useAuthStore } from '@/stores/auth'
import { timeAgo } from '@/libs/utils/time'
import type { Conversation, User } from '@/types/api'
import {
  ChevronLeft,
  Image as ImageIcon,
  Camera,
  MapPin,
  FileText,
  BarChart3,
  MoreHorizontal,
  Plus,
  Send,
  Search,
  X,
} from 'lucide-react'

function other(conv: Conversation, meId?: string): User | undefined {
  return conv.participants.find((p) => p.id !== meId) ?? conv.participants[0]
}

export function MessagesPage() {
  const { data: conversations, isLoading } = useConversations()
  const me = useAuthStore((s) => s.user)
  const [activeId, setActiveId] = useState<string | null>(null)

  const list = conversations ?? []
  const active = list.find((c) => c.id === activeId) ?? list[0]

  return (
    <div className="mx-auto w-full max-w-[900px] px-2 pb-24 pt-3 lg:px-7 lg:pb-8 lg:pt-7">
      <div className="flex h-[calc(100vh-150px)] min-h-[520px] overflow-hidden rounded-[18px] border border-line bg-card">
        {/* Conversation list */}
        <div className="flex w-full shrink-0 flex-col border-line-mid lg:w-[286px] lg:border-r">
          <div className="border-b border-line-row p-3.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint-2" strokeWidth={2} />
              <input
                placeholder="Cari pesan"
                className="w-full rounded-[11px] border border-line-input bg-input py-2.5 pl-9 pr-3 text-[13.5px] text-ink outline-none placeholder:text-faint-2 focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-[46px] w-[46px] rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : list.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Belum ada percakapan</p>
            ) : (
              list.map((conv) => {
                const o = other(conv, me?.id)
                const isActive = active?.id === conv.id
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={`mb-0.5 flex w-full items-center gap-3 rounded-[14px] border p-3 text-left transition-colors ${
                      isActive
                        ? 'border-brand-500/[0.22] bg-brand-500/10'
                        : 'border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar src={o?.avatarUrl} alt={o?.displayName ?? ''} seed={o?.username} size="lg" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-[14.5px] font-bold text-[#f0f0f4]">
                          {o?.displayName}
                        </span>
                        {conv.lastMessage && (
                          <span className="shrink-0 text-[12px] text-faint-2">
                            {timeAgo(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] text-muted-4">
                          {conv.lastMessage?.content ?? 'Mulai percakapan'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Active conversation (desktop) */}
        <div className="hidden min-w-0 flex-1 lg:flex">
          {active ? (
            <ChatPane conversation={active} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted">
              Pilih percakapan untuk mulai mengobrol
            </div>
          )}
        </div>
      </div>

      {/* On mobile, tapping a conversation opens the full-screen thread route */}
      {active && (
        <Link
          to="/messages/$id"
          params={{ id: active.id }}
          className="mt-3 block rounded-xl bg-grad-brand py-3 text-center text-[14px] font-bold text-white lg:hidden"
        >
          Buka {other(active, me?.id)?.displayName}
        </Link>
      )}
    </div>
  )
}

function ChatPane({ conversation }: { conversation: Conversation }) {
  const me = useAuthStore((s) => s.user)
  const { data } = useMessages(conversation.id)
  const send = useSendMessage()
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const o = other(conversation, me?.id)

  const messages = data?.pages.flatMap((p) => p.data) ?? []
  // API returns newest-first per page; show oldest→newest
  const ordered = [...messages].reverse()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ordered.length])

  const submit = () => {
    if (!text.trim()) return
    send.mutate(
      { conversationId: conversation.id, recipientId: o?.id, content: text.trim() },
      { onSuccess: () => setText('') },
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line-row p-[14px_18px]">
        <Avatar src={o?.avatarUrl} alt={o?.displayName ?? ''} seed={o?.username} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-bold">{o?.displayName}</div>
          <div className="text-[12.5px] text-[#2ecf8f]">Aktif sekarang</div>
        </div>
        <button className="rounded-[9px] p-1.5 leading-none text-muted hover:bg-white/[0.06] hover:text-[#c9c9d2]">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {ordered.map((m) => {
          const mine = m.sender.id === me?.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div>
                <div
                  className={`max-w-[74%] rounded-[18px] px-[15px] py-[11px] text-[14.5px] leading-relaxed ${
                    mine
                      ? 'rounded-br-[5px] bg-grad-brand text-white'
                      : 'rounded-bl-[5px] bg-[#1a1a22] text-[#e6e6ec]'
                  }`}
                >
                  {m.content}
                </div>
                <div className={`mt-1 text-[11px] ${mine ? 'text-right text-white/60' : 'text-faint-2'}`}>
                  {timeAgo(m.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <MessageComposer text={text} setText={setText} onSend={submit} />
    </div>
  )
}

function MessageComposer({
  text,
  setText,
  onSend,
}: {
  text: string
  setText: (v: string) => void
  onSend: () => void
}) {
  const [attachOpen, setAttachOpen] = useState(false)
  const [modal, setModal] = useState<null | 'location' | 'poll'>(null)

  return (
    <div className="relative flex items-center gap-2.5 border-t border-line-row p-[14px_16px]">
      {attachOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setAttachOpen(false)} />
          <div className="absolute bottom-[68px] left-3 z-30 min-w-[200px] animate-rx-pop rounded-[18px] border border-line-strong bg-popover p-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
            <AttachItem icon={<ImageIcon className="h-[18px] w-[18px]" />} color="#3b82f6" label="Foto & Video" onClick={() => setAttachOpen(false)} />
            <AttachItem icon={<Camera className="h-[18px] w-[18px]" />} color="#ec4899" label="Kamera & Video" onClick={() => setAttachOpen(false)} />
            <AttachItem icon={<MapPin className="h-[18px] w-[18px]" />} color="#10b981" label="Lokasi" onClick={() => { setAttachOpen(false); setModal('location') }} />
            <AttachItem icon={<FileText className="h-[18px] w-[18px]" />} color="#f59e0b" label="Dokumen" onClick={() => setAttachOpen(false)} />
            <AttachItem icon={<BarChart3 className="h-[18px] w-[18px]" />} color="#8b5cf6" label="Polling" onClick={() => { setAttachOpen(false); setModal('poll') }} />
          </div>
        </>
      )}

      <button
        onClick={() => setAttachOpen((v) => !v)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-violet-soft transition hover:bg-brand-500/20"
      >
        <Plus className="h-5 w-5" strokeWidth={2.2} />
      </button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder="Tulis pesan..."
        className="flex-1 rounded-[13px] border border-line-input bg-input p-[12px_16px] text-[14.5px] text-ink outline-none focus:border-brand-500"
      />

      <button
        onClick={onSend}
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-grad-brand text-white shadow-[0_4px_16px_rgba(124,58,237,0.45)] transition hover:scale-105 hover:brightness-110"
      >
        <Send className="h-[18px] w-[18px]" />
      </button>

      {modal === 'location' && <LocationModal onClose={() => setModal(null)} />}
      {modal === 'poll' && <PollModal onClose={() => setModal(null)} />}
    </div>
  )
}

function AttachItem({
  icon,
  color,
  label,
  onClick,
}: {
  icon: React.ReactNode
  color: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-[11px_14px] text-[14.5px] font-semibold text-ink-dim hover:bg-white/[0.06]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white"
        style={{ backgroundImage: `linear-gradient(135deg, ${color}, ${color})` }}
      >
        {icon}
      </span>
      {label}
    </button>
  )
}

const DURATIONS = ['30 menit', '1 jam', '2 jam', '5 jam', '8 jam', '12 jam', '24 jam']

function LocationModal({ onClose }: { onClose: () => void }) {
  const [dur, setDur] = useState<string | null>(null)
  return (
    <div onClick={onClose} className="fixed inset-0 z-[110] flex animate-rx-fade items-end justify-center bg-[#050509]/75 backdrop-blur-[4px]">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[540px] animate-rx-pop rounded-t-[22px] border border-[#24242e] bg-modal p-[24px_22px_32px]">
        <div className="mx-auto mb-[22px] h-1 w-10 rounded-full bg-line-strong" />
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#10b981] to-[#059669]">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-[18px] font-extrabold tracking-[-0.3px]">Bagikan Lokasi</div>
            <div className="mt-0.5 text-[13.5px] text-muted">Pilih durasi berbagi lokasi real-time</div>
          </div>
        </div>
        <div className="my-4 flex items-center gap-2.5 rounded-[14px] border border-line-mid bg-input p-[13px_16px]">
          <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#2ecf8f]" />
          <span className="text-[14px] text-muted-2">Jakarta Selatan, Indonesia</span>
          <span className="ml-auto text-[13px] text-muted">Akurat 12m</span>
        </div>
        <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">Durasi berbagi</div>
        <div className="mb-6 flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDur(d)}
              className={`min-w-[calc(25%-8px)] flex-1 rounded-[12px] border-[1.5px] p-[11px_6px] text-[13.5px] font-bold transition ${
                dur === d
                  ? 'border-brand-500 bg-brand-500/[0.12] text-violet-soft-2'
                  : 'border-line-input bg-input text-muted-2'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full rounded-[14px] bg-gradient-to-br from-[#10b981] to-[#059669] p-[15px] text-[16px] font-bold text-white transition hover:brightness-110"
        >
          Bagikan Lokasi
        </button>
      </div>
    </div>
  )
}

function PollModal({ onClose }: { onClose: () => void }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  return (
    <div onClick={onClose} className="fixed inset-0 z-[110] flex animate-rx-fade items-start justify-center overflow-y-auto bg-[#050509]/75 px-5 pb-5 pt-[7vh] backdrop-blur-[4px]">
      <div onClick={(e) => e.stopPropagation()} className="mb-5 w-full max-w-[520px] animate-rx-pop overflow-hidden rounded-[22px] border border-[#24242e] bg-modal shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-[#1e1e26] p-[17px_22px]">
          <button onClick={onClose} className="text-[15px] font-semibold text-muted-2 hover:text-ink">Batal</button>
          <span className="text-[16px] font-extrabold">Buat Polling</span>
          <span className="w-11" />
        </div>
        <div className="p-[22px]">
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">Pertanyaan</div>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tulis pertanyaanmu di sini..."
            className="mb-5 w-full rounded-[13px] border-[1.5px] border-line-input bg-input p-[13px_16px] text-[15.5px] text-ink outline-none focus:border-brand-500"
          />
          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">Pilihan</div>
          <div className="mb-3 flex flex-col gap-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-grad-brand" />
                <input
                  value={opt}
                  onChange={(e) => setOptions((o) => o.map((v, j) => (j === i ? e.target.value : v)))}
                  placeholder={`Pilihan ${i + 1}`}
                  className="flex-1 rounded-[11px] border-[1.5px] border-line-input bg-input p-[11px_14px] text-[14.5px] text-ink outline-none focus:border-brand-500"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions((o) => o.filter((_, j) => j !== i))}
                    className="rounded-lg p-1.5 leading-none text-faint-2 hover:bg-[#fb5a7e]/[0.08] hover:text-[#fb5a7e]"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              onClick={() => setOptions((o) => [...o, ''])}
              className="mb-5 flex w-full items-center gap-2 rounded-[11px] border-[1.5px] border-dashed border-line-strong p-[11px_16px] text-[14px] font-semibold text-muted transition hover:border-brand-500 hover:text-violet-soft"
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
              Tambah pilihan
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-[14px] bg-grad-brand p-[15px] text-[16px] font-bold text-white shadow-brand transition hover:brightness-110"
          >
            Kirim Polling
          </button>
        </div>
      </div>
    </div>
  )
}

export function MessageThreadPage() {
  const { id: conversationId } = useParams({ from: '/_layout/messages/$id' })
  const { data } = useMessages(conversationId)
  const send = useSendMessage()
  const [text, setText] = useState('')
  const me = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const endRef = useRef<HTMLDivElement>(null)

  const messages = data?.pages.flatMap((p) => p.data) ?? []
  const ordered = [...messages].reverse()
  const o = ordered.find((m) => m.sender.id !== me?.id)?.sender

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ordered.length])

  const submit = () => {
    if (!text.trim()) return
    send.mutate(
      { conversationId, recipientId: o?.id, content: text.trim() },
      { onSuccess: () => setText('') },
    )
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <div className="flex items-center gap-3 border-b border-line-row p-[14px_16px]">
        <button onClick={() => navigate({ to: '/messages' })} className="p-1 leading-none text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        {o && (
          <>
            <Avatar src={o.avatarUrl} alt={o.displayName} seed={o.username} size="md" />
            <div>
              <div className="text-[15px] font-bold">{o.displayName}</div>
              <div className="text-[12px] text-[#2ecf8f]">Aktif sekarang</div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {ordered.map((m) => {
          const mine = m.sender.id === me?.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-[18px] px-[15px] py-[11px] text-[14.5px] leading-relaxed ${
                  mine ? 'rounded-br-[5px] bg-grad-brand text-white' : 'rounded-bl-[5px] bg-[#1a1a22] text-[#e6e6ec]'
                }`}
              >
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <MessageComposer text={text} setText={setText} onSend={submit} />
    </div>
  )
}
