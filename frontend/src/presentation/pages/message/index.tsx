'use client'

import { useEffect, useState } from 'react'
import { getConversations, getMessages, sendMessage } from '@/infrastructure/api'
import type { User, Message } from '@/core/domain/entities'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function MessagePage() {
  const [conversations, setConvs] = useState<User[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')

  useEffect(() => { getConversations().then(setConvs) }, [])

  const selectConv = async (id: string) => {
    setSelected(id)
    const msgs = await getMessages(id)
    setMessages(msgs)
  }

  const send = async () => {
    if (!text.trim() || !selected) return
    const msg = await sendMessage(selected, text)
    setMessages(prev => [...prev, msg])
    setText('')
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className="w-1/3 border-r space-y-2 pr-2">
        <h3 className="font-bold">Chats</h3>
        {conversations.map(u => (
          <div key={u.id} className={`p-2 rounded cursor-pointer hover:bg-muted ${selected === u.id ? 'bg-muted' : ''}`}
            onClick={() => selectConv(u.id)}>
            <p className="font-semibold text-sm">{u.name}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {messages.map(m => (
                <div key={m.id} className={`p-2 rounded max-w-[80%] ${m.senderId === selected ? 'bg-primary text-primary-foreground self-start' : 'bg-muted self-end ml-auto'}`}>
                  <p className="text-sm">{m.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
              <Button onClick={send}>Send</Button>
            </div>
          </>
        ) : <p className="text-muted-foreground">Select a conversation</p>}
      </div>
    </div>
  )
}