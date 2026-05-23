type MessageHandler = (data: unknown) => void

class WSClient {
  private ws: WebSocket | null = null
  private handlers = new Map<string, MessageHandler[]>()
  private url: string

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws'
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.ws = new WebSocket(`${this.url}?token=${token}`)

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        const hs = this.handlers.get(msg.type) || []
        hs.forEach(h => h(msg.payload))
      } catch { /* ignore malformed */ }
    }

    this.ws.onclose = () => {
      setTimeout(() => {
        const t = typeof window !== 'undefined' && localStorage.getItem('ruangx_token')
        if (t) this.connect(t)
      }, 3000)
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, [])
    this.handlers.get(type)!.push(handler)
  }

  off(type: string, handler: MessageHandler) {
    const hs = this.handlers.get(type)
    if (hs) this.handlers.set(type, hs.filter(h => h !== handler))
  }

  send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }
}

export const wsClient = new WSClient()