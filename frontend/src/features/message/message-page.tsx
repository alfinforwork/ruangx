import { Link, useParams } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations, useMessages, useSendMessage } from '@/hooks/message/use-message'
import { useAuthStore } from '@/stores/auth'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'
import { Mail, ChevronLeft, Send, MessageSquare } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/libs/utils/cn'

export function MessagesPage() {
  const { data: conversations, isLoading } = useConversations()
  const currentUser = useAuthStore((s) => s.user)

  if (isLoading) {
    return (
      <div className="divide-y divide-surface-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
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
      <div className="sticky top-0 z-10 border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg px-4 py-3">
        <h1 className="text-lg font-bold text-white">Pesan</h1>
      </div>

      {(!conversations || conversations.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <MessageSquare className="h-12 w-12 mb-3" />
          <p className="text-sm">Belum ada pesan</p>
          <p className="text-xs mt-1">Mulai percakapan dengan seseorang</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-800">
          {conversations.map((conv) => {
            const other = conv.participants.find(
              (p) => p.id !== currentUser?.id,
            )
            if (!other) return null
            return (
              <Link
                key={conv.id}
                to="/messages/$id" params={{ id: conv.id }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-800/50"
              >
                <Avatar
                  src={other.avatarUrl}
                  alt={other.displayName}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white text-sm">
                      {other.displayName}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          new Date(conv.lastMessage.createdAt),
                          { addSuffix: true, locale: id },
                        )}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    {conv.lastMessage?.content ?? 'Mulai percakapan'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function MessageThreadPage() {
  const { id: conversationId } = useParams({ from: '/_layout/messages/$id' })
  const { data, fetchNextPage, hasNextPage } = useMessages(conversationId)
  const sendMessage = useSendMessage()
  const [content, setContent] = useState('')
  const currentUser = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = data?.pages.flatMap((p) => p.data) ?? []
  const otherParticipant = messages.find((m) => m.sender.id !== currentUser?.id)?.sender

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    if (!content.trim()) return
    sendMessage.mutate(
      { conversationId, content: content.trim() },
      {
        onSuccess: () => {
          setContent('')
          if (inputRef.current) {
            inputRef.current.style.height = 'auto'
          }
        },
      },
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-800 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/messages' })}
          className="rounded-full p-1 text-white hover:bg-surface-800 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {otherParticipant && (
          <div className="flex items-center gap-2">
            <Avatar
              src={otherParticipant.avatarUrl}
              alt={otherParticipant.displayName}
              size="sm"
            />
            <span className="font-semibold text-white text-sm">
              {otherParticipant.displayName}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const isOwn = msg.sender.id === currentUser?.id
          return (
            <div
              key={msg.id}
              className={cn(
                'flex',
                isOwn ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2',
                  isOwn
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-surface-800 text-gray-100 rounded-bl-md',
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    isOwn ? 'text-brand-200' : 'text-gray-500',
                  )}
                >
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-800 p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ketik pesan..."
            className="flex-1 resize-none rounded-xl border border-surface-700 bg-surface-850 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!content.trim()}
            loading={sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}