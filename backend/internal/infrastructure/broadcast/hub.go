package broadcast

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

type EventType string

const (
	EventNewPost         EventType = "new_post"
	EventNewLike         EventType = "new_like"
	EventNewNotification EventType = "new_notification"
	EventNewMessage      EventType = "new_message"
	EventNewFollow       EventType = "new_follow"
)

type Event struct {
	Type EventType   `json:"type"`
	Data interface{} `json:"data"`
}

type WSClient struct {
	userID string
	conn   *websocket.Conn
	send   chan []byte
}

type Message struct {
	Event      Event    `json:"event"`
	Recipients []string `json:"recipients"`
}

type Hub struct {
	mu          sync.RWMutex
	clients     map[string]*WSClient
	register    chan *WSClient
	unregister  chan *WSClient
	broadcast   chan Message
	upgrader    websocket.Upgrader
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*WSClient),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
		broadcast:  make(chan Message, 256),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.userID] = client
			h.mu.Unlock()
			log.Info().Str("user_id", client.userID).Msg("WebSocket client registered")

		case client := <-h.unregister:
			h.mu.Lock()
			delete(h.clients, client.userID)
			h.mu.Unlock()
			close(client.send)
			log.Info().Str("user_id", client.userID).Msg("WebSocket client unregistered")

		case msg := <-h.broadcast:
			data, err := json.Marshal(msg.Event)
			if err != nil {
				log.Error().Err(err).Msg("Failed to marshal event")
				continue
			}
			h.mu.RLock()
			for _, userID := range msg.Recipients {
				if client, ok := h.clients[userID]; ok {
					select {
					case client.send <- data:
					default:
						delete(h.clients, userID)
						close(client.send)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error().Err(err).Msg("WebSocket upgrade failed")
		return
	}

	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		conn.Close()
		return
	}

	client := &WSClient{
		userID: userID,
		conn:   conn,
		send:   make(chan []byte, 256),
	}

	h.register <- client

	go client.writePump()
	client.readPump(h)
}

func (c *WSClient) readPump(h *Hub) {
	defer func() {
		h.unregister <- c
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *WSClient) writePump() {
	defer c.conn.Close()

	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			return
		}
	}
}

func (h *Hub) Broadcast(event Event, userIDs ...string) {
	h.broadcast <- Message{
		Event:      event,
		Recipients: userIDs,
	}
}

func (h *Hub) SendToUser(userID string, event Event) {
	h.Broadcast(event, userID)
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.HandleWebSocket(w, r)
}