import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth'

type MessageHandler = (data: any) => void

interface SocketHandlers {
  onPost?: MessageHandler
  onLike?: MessageHandler
  onNotification?: MessageHandler
  onMessage?: MessageHandler
  onTyping?: MessageHandler
}

// Simple singleton WebSocket manager
class SocketManager {
  private ws: WebSocket | null = null
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url: string = ''
  private token: string | null = null

  connect(url: string, token: string | null) {
    this.url = url
    this.token = token

    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(url)
    this.ws.onopen = () => console.log('[WS] Connected')
    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        const type = msg.type as string
        const typeHandlers = this.handlers.get(type)
        typeHandlers?.forEach((h) => h(msg.payload ?? msg))
      } catch { /* ignore */ }
    }
    this.ws.onclose = () => {
      console.log('[WS] Disconnected')
      this.scheduleReconnect()
    }
    this.ws.onerror = () => this.ws?.close()
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.token) this.connect(this.url, this.token)
    }, 5000)
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)?.delete(handler)
  }

  send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    this.ws?.close()
    this.ws = null
  }
}

const socketManager = new SocketManager()

export function useSocket(handlers: SocketHandlers = {}) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080'
    socketManager.connect(wsUrl, accessToken)

    const unsubs: (() => void)[] = []
    if (handlers.onPost) unsubs.push(socketManager.subscribe('post', handlers.onPost))
    if (handlers.onLike) unsubs.push(socketManager.subscribe('like', handlers.onLike))
    if (handlers.onNotification) unsubs.push(socketManager.subscribe('notification', handlers.onNotification))
    if (handlers.onMessage) unsubs.push(socketManager.subscribe('message', handlers.onMessage))
    if (handlers.onTyping) unsubs.push(socketManager.subscribe('typing', handlers.onTyping))

    return () => {
      unsubs.forEach((u) => u())
      socketManager.disconnect()
    }
  }, [isAuthenticated])

  return {
    send: socketManager.send.bind(socketManager),
  }
}

export { socketManager }