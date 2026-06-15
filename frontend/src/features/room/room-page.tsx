import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useRoomList,
  useRoom,
  useJoinRoom,
  useLeaveRoom,
  useCreateRoom,
} from '@/hooks/room/use-room'
import { gradientFor, initialsFor } from '@/libs/utils/gradient'
import type { Room } from '@/types/api'
import { ChevronLeft, MessageSquare, Plus, Sparkles, X } from 'lucide-react'

function fmt(n: number) {
  return n.toLocaleString('id-ID')
}

function JoinButton({ room, full }: { room: Room; full?: boolean }) {
  const join = useJoinRoom()
  const leave = useLeaveRoom()
  const [joined, setJoined] = useState(room.isJoined)

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (joined) {
      setJoined(false)
      leave.mutate(room.id)
    } else {
      setJoined(true)
      join.mutate(room.id)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`shrink-0 rounded-[12px] font-bold transition ${
        full ? 'px-6 py-[11px] text-[14.5px]' : 'px-[18px] py-2 text-[13.5px]'
      } ${
        joined
          ? 'border border-line-strong bg-transparent text-[#c9c9d2] hover:bg-white/[0.05]'
          : 'bg-grad-brand text-white hover:brightness-110'
      }`}
    >
      {joined ? 'Bergabung' : 'Gabung'}
    </button>
  )
}

export function RoomsPage() {
  const { data, isLoading } = useRoomList()
  const [tab, setTab] = useState<'diskusi' | 'live'>('diskusi')
  const [createOpen, setCreateOpen] = useState(false)
  const rooms = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      {/* Header */}
      <div className="mb-[18px] flex items-center justify-between gap-3.5">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.4px]">Ruang</h1>
          <p className="mt-0.5 text-[13.5px] text-muted">Komunitas berdasarkan topik dan format</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-[13px] bg-grad-brand px-5 py-[11px] text-[14.5px] font-bold text-white shadow-brand transition hover:brightness-110"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
          Buat Ruang
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex overflow-hidden rounded-[16px] border border-line bg-card">
        <button
          onClick={() => setTab('diskusi')}
          className={`flex-1 border-b-[2.5px] py-3.5 text-[15px] transition ${
            tab === 'diskusi'
              ? 'border-brand-500 font-bold text-ink-bright'
              : 'border-transparent font-semibold text-muted'
          }`}
        >
          Ruang Diskusi
        </button>
        <button
          onClick={() => setTab('live')}
          className={`flex-1 cursor-not-allowed border-b-[2.5px] py-3.5 text-[15px] opacity-60 ${
            tab === 'live' ? 'border-brand-500 font-bold text-ink-bright' : 'border-transparent font-semibold text-muted'
          }`}
        >
          Ruang Live
          <span className="ml-1.5 rounded-full border border-[#fb923c]/30 bg-[#fb923c]/15 px-2 py-0.5 align-middle text-[11px] font-bold text-[#fb923c]">
            Segera Hadir
          </span>
        </button>
      </div>

      {tab === 'live' ? (
        <LiveComingSoon />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 rounded-[16px] border border-line bg-card p-[18px]">
              <Skeleton className="h-[54px] w-[54px] rounded-[16px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-card py-16 text-center text-muted">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p className="text-[15px] font-semibold text-ink">Belum ada ruang</p>
          <p className="mt-1 text-sm">Jadilah yang pertama membuat ruang diskusi.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to="/rooms/$id"
              params={{ id: room.id }}
              className="flex items-center gap-[15px] rounded-[16px] border border-line bg-card p-[18px] transition-colors hover:border-line-strong"
            >
              <div
                className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] text-[17px] font-bold text-white"
                style={{ backgroundImage: gradientFor(room.id) }}
              >
                {initialsFor(room.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[16px] font-bold text-[#f0f0f4]">{room.name}</span>
                  <span className="rounded-full border border-brand-500/20 bg-brand-500/[0.12] px-2 py-0.5 text-[11.5px] font-bold text-violet-soft">
                    Diskusi
                  </span>
                </div>
                <div className="my-1 text-[12.5px] text-muted">{fmt(room.memberCount)} anggota</div>
                {room.description && (
                  <div className="line-clamp-2 text-[13.5px] leading-snug text-muted-3">
                    {room.description}
                  </div>
                )}
              </div>
              <JoinButton room={room} />
            </Link>
          ))}
        </div>
      )}

      {createOpen && <CreateRoomModal onClose={() => setCreateOpen(false)} />}
    </div>
  )
}

function LiveComingSoon() {
  return (
    <div className="rounded-[20px] border border-line bg-card p-[52px_24px] text-center">
      <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-[#fb923c]/25 bg-[#fb923c]/10">
        <Sparkles className="h-8 w-8 text-[#fb923c]" />
      </div>
      <div className="mb-2 text-[20px] font-extrabold tracking-[-0.3px]">Ruang Live segera hadir</div>
      <p className="mx-auto mb-6 max-w-[380px] text-[14.5px] leading-relaxed text-muted">
        Siapkan dirimu untuk siaran langsung, sesi tanya jawab, dan diskusi real-time bersama
        komunitas ruangx.
      </p>
      <div className="inline-flex items-center gap-2 rounded-[12px] border border-[#fb923c]/[0.22] bg-[#fb923c]/[0.08] px-5 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#fb923c]" />
        <span className="text-[14px] font-bold text-[#fb923c]">Dalam Pengembangan</span>
      </div>
    </div>
  )
}

const COLORS = [
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#f472b6,#db2777)',
  'linear-gradient(135deg,#f59e0b,#ea580c)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
  'linear-gradient(135deg,#ec4899,#9333ea)',
  'linear-gradient(135deg,#f97316,#dc2626)',
]

function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const create = useCreateRoom()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const submit = async () => {
    if (!name.trim() || create.isPending) return
    const room = await create.mutateAsync({
      name: name.trim(),
      description: desc.trim() || undefined,
      isPrivate: false,
    })
    onClose()
    if (room?.id) navigate({ to: '/rooms/$id', params: { id: room.id } })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex animate-rx-fade items-start justify-center overflow-y-auto bg-[#050509]/75 px-5 pb-5 pt-[6vh] backdrop-blur-[4px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mb-5 w-full max-w-[560px] animate-rx-pop overflow-hidden rounded-[22px] border border-[#24242e] bg-modal shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between border-b border-[#1e1e26] p-[17px_22px]">
          <button onClick={onClose} className="text-[15px] font-semibold text-muted-2 hover:text-ink">
            Batal
          </button>
          <span className="text-[16px] font-extrabold">Buat Ruang</span>
          <span className="w-11" />
        </div>

        <div className="p-[22px]">
          {/* Type */}
          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">
            Tipe Ruang
          </div>
          <div className="mb-[22px] grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 rounded-[13px] border-[1.5px] border-brand-500 bg-brand-500/10 p-[13px_16px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-violet-soft">
                <MessageSquare className="h-[22px] w-[22px]" strokeWidth={1.9} />
              </div>
              <div>
                <div className="text-[14.5px] font-bold text-[#f0f0f4]">Ruang Diskusi</div>
                <div className="mt-0.5 text-[12px] text-muted">Thread & obrolan</div>
              </div>
            </div>
            <div className="flex cursor-not-allowed items-center gap-2.5 rounded-[13px] border-[1.5px] border-line-input bg-[#0f0f14] p-[13px_16px] opacity-55">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fb923c]/[0.08] text-[#fb923c]">
                <Sparkles className="h-[22px] w-[22px]" strokeWidth={1.9} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14.5px] font-bold text-faint-2">Ruang Live</span>
                  <span className="rounded-full border border-[#fb923c]/25 bg-[#fb923c]/[0.12] px-1.5 text-[10px] font-bold text-[#fb923c]">
                    Segera
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-faint-3">Siaran langsung</div>
              </div>
            </div>
          </div>

          {/* Name */}
          <Field label="Nama Ruang">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="cth. Ruang Produktif"
              className="w-full rounded-[13px] border-[1.5px] border-line-input bg-input p-[13px_16px] text-[15.5px] text-ink outline-none focus:border-brand-500"
            />
          </Field>

          {/* Description */}
          <Field label="Deskripsi">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Ceritakan tentang ruang ini..."
              className="w-full resize-none rounded-[13px] border-[1.5px] border-line-input bg-input p-[13px_16px] text-[15px] leading-relaxed text-ink outline-none focus:border-brand-500"
            />
          </Field>

          {/* Color */}
          <div className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">
            Warna Ruang
          </div>
          <div className="mb-[22px] flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundImage: c }}
                className={`h-[38px] w-[38px] rounded-[11px] border-[3px] transition-transform hover:scale-110 ${
                  color === c ? 'border-violet-soft-2' : 'border-transparent'
                }`}
              />
            ))}
          </div>

          <button
            onClick={submit}
            disabled={!name.trim() || create.isPending}
            className="w-full rounded-[14px] bg-grad-brand p-[15px] text-[16px] font-bold text-white shadow-brand transition hover:brightness-110 disabled:opacity-50"
          >
            Buat Ruang
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">{label}</div>
      {children}
    </div>
  )
}

export function RoomDetailPage() {
  const { id } = useParams({ from: '/_layout/rooms/$id' })
  const { data: room, isLoading } = useRoom(id)
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      <button
        onClick={() => navigate({ to: '/rooms' })}
        className="mb-4 flex items-center gap-1.5 text-[15px] font-semibold text-muted-2 hover:text-ink"
      >
        <ChevronLeft className="h-5 w-5" />
        Ruang
      </button>

      {isLoading || !room ? (
        <div className="space-y-4">
          <Skeleton className="h-[120px] w-full rounded-[20px]" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <RoomDetailBody room={room} />
      )}
    </div>
  )
}

function RoomDetailBody({ room }: { room: Room }) {
  return (
    <>
      <div className="mb-[18px] overflow-hidden rounded-[20px] border border-line">
        <div className="h-[120px]" style={{ backgroundImage: gradientFor(room.id) }} />
        <div className="bg-card px-[22px] pb-[22px]">
          <div className="-mt-[30px] flex items-end justify-between gap-2.5">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border-4 border-card text-2xl font-bold text-white"
              style={{ backgroundImage: gradientFor(room.id) }}
            >
              {initialsFor(room.name)}
            </div>
            <JoinButton room={room} full />
          </div>
          <div className="mt-3.5 text-[22px] font-extrabold tracking-[-0.4px]">{room.name}</div>
          <div className="mt-0.5 text-[13.5px] text-muted">{fmt(room.memberCount)} anggota</div>
          {room.description && (
            <div className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">{room.description}</div>
          )}
        </div>
      </div>

      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="text-[16px] font-bold text-[#c9c9d2]">Thread terbaru</span>
        <span className="h-px flex-1 bg-line-mid" />
      </div>

      <div className="rounded-[18px] border border-line bg-card py-14 text-center text-muted">
        <p className="text-[15px] font-semibold text-ink">Belum ada thread</p>
        <p className="mt-1 text-sm">Thread di ruang ini akan tampil di sini.</p>
      </div>
    </>
  )
}
