'use client'

import { useEffect, useState } from 'react'
import { getNotifications, markNotificationRead } from '@/infrastructure/api'
import type { Notification } from '@/core/domain/entities'
import { Card, CardContent } from '@/components/ui/card'

export default function NotificationPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])

  useEffect(() => { getNotifications().then(setNotifs) }, [])

  const handleClick = async (id: string) => {
    await markNotificationRead(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Notifications</h2>
      {notifs.length === 0 && <p className="text-muted-foreground">No notifications yet</p>}
      {notifs.map(n => (
        <Card key={n.id} className={`cursor-pointer ${n.read ? 'opacity-60' : ''}`} onClick={() => handleClick(n.id)}>
          <CardContent className="pt-4">
            <p className="text-sm">{n.message}</p>
            <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}