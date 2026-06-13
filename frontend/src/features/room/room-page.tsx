import { Link, useParams } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useRoomList, useRoom, useJoinRoom, useLeaveRoom } from '@/hooks/room/use-room'
import { useAuthStore } from '@/stores/auth'
import { MessagesSquare, Users, Lock, Globe, ChevronLeft, Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function RoomsPage() {
  const { data, fetchNextPage, hasNextPage, isLoading } = useRoomList()
  const rooms = data?.pages.flatMap((p) => p.data) ?? []

  if (isLoading) {
    return (
      <div className="divide-y divide-surface-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg px-4 py-3">
        <h1 className="text-lg font-bold text-white">Ruang</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <MessagesSquare className="h-12 w-12 mb-3" />
          <p className="text-sm">Belum ada ruang</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-800">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to="/rooms/$id" params={{ id: room.id }}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-800/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-lg font-bold text-brand-400">
                {room.icon?.[0]?.toUpperCase() ?? room.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">
                    {room.name}
                  </span>
                  {room.isPrivate ? (
                    <Lock className="h-3 w-3 text-gray-500" />
                  ) : (
                    <Globe className="h-3 w-3 text-gray-500" />
                  )}
                </div>
                {room.description && (
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    {room.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {room.memberCount} anggota · {room.postCount} kiriman
                </p>
              </div>
              {room.isJoined && (
                <Badge variant="brand" className="text-[10px]">
                  Bergabung
                </Badge>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function RoomDetailPage() {
  const { id } = useParams({ from: '/_layout/rooms/$id' })
  const { data: room, isLoading } = useRoom(id)
  const joinRoom = useJoinRoom()
  const leaveRoom = useLeaveRoom()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">Ruang tidak ditemukan</p>
      </div>
    )
  }

  const handleJoinToggle = () => {
    if (room.isJoined) {
      leaveRoom.mutate(id)
    } else {
      joinRoom.mutate(id)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-surface-800 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/rooms' })}
          className="rounded-full p-1 text-white hover:bg-surface-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Ruang</h1>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/20 text-2xl font-bold text-brand-400">
              {room.icon?.[0]?.toUpperCase() ?? room.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{room.name}</h2>
              <p className="text-sm text-gray-500">
                {room.memberCount} anggota
              </p>
            </div>
          </div>
          <Button
            variant={room.isJoined ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleJoinToggle}
            loading={joinRoom.isPending || leaveRoom.isPending}
          >
            {room.isJoined ? 'Keluar' : 'Bergabung'}
          </Button>
        </div>

        {room.description && (
          <p className="text-sm text-gray-300 mb-4">{room.description}</p>
        )}

        <Separator className="mb-4" />

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">
            Dibuat oleh
          </h3>
          <Link
            to="/profile/$username" params={{ username: room.owner.username }}
            className="flex items-center gap-2"
          >
            <Avatar
              src={room.owner.avatarUrl}
              alt={room.owner.displayName}
              size="sm"
            />
            <span className="text-sm text-gray-200">
              {room.owner.displayName}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}