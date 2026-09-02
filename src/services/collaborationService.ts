import { createClient } from '@supabase/supabase-js'
import { WebSocket } from 'ws'

export class CollaborationService {
  private static instance: CollaborationService
  private ws: WebSocket | null = null
  private subscribers: Map<string, Function[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService()
    }
    return CollaborationService.instance
  }

  // Initialize WebSocket connection with auto-reconnect
  connect(url: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.ws = new WebSocket(url)
    
    this.ws.onopen = () => {
      console.log('🔌 Collaboration WebSocket connected')
      this.reconnectAttempts = 0
      this.setupWebSocketHandlers()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('🔌 Collaboration WebSocket disconnected')
      this.attemptReconnect(url)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket connection error:', error)
    }
  }

  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect(url)
      }, Math.pow(2, this.reconnectAttempts) * 1000) // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private setupWebSocketHandlers() {
    // Handle scene update broadcasts
    this.subscribe('scene_update', (payload) => {
      this.notifySubscribers('scene_update', payload)
    })

    // Handle user presence updates
    this.subscribe('user_joined', (payload) => {
      this.notifySubscribers('user_joined', payload)
    })

    // Handle user left notifications
    this.subscribe('user_left', (payload) => {
      this.notifySubscribers('user_left', payload)
    })

    // Handle cursor updates
    this.subscribe('cursor_update', (payload) => {
      this.notifySubscribers('cursor_update', payload)
    })

    // Handle gesture recognition
    this.subscribe('gesture_recognized', (payload) => {
      this.notifySubscribers('gesture_recognized', payload)
    })
  }

  private handleMessage(data: any) {
    const { type, payload } = data
    this.storeMessage(type, payload)
    this.notifySubscribers(type, payload)
  }

  private storeMessage(type: string, payload: any) {
    const key = `collab_message_${type}_${Date.now()}`
    localStorage.setItem(key, JSON.stringify(payload))

    const keys = Object.keys(localStorage).filter(k => k.startsWith('collab_message_'))
    if (keys.length > 100) {
      const oldestKey = keys.sort().shift()
      if (oldestKey) {
        localStorage.removeItem(oldestKey)
      }
    }
  }

  public subscribe(eventType: string, callback: Function): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }

    const subscribers = this.subscribers.get(eventType)!
    subscribers.push(callback)

    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  public publish(eventType: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: eventType, payload }))
    } else {
      console.warn('WebSocket is not connected. Message will be queued.')
    }
  }

  // Scene management methods
  joinScene(sceneId: string, userId: string, userInfo: any) {
    this.publish('join_scene', {
      sceneId,
      userId,
      userInfo,
      timestamp: Date.now()
    })
  }

  leaveScene(sceneId: string, userId: string) {
    this.publish('leave_scene', {
      sceneId,
      userId,
      timestamp: Date.now()
    })
  }

  updateCursor(sceneId: string, userId: string, cursor: any) {
    this.publish('cursor_update', {
      sceneId,
      userId,
      cursor,
      timestamp: Date.now()
    })
  }

  broadcastGesture(sceneId: string, userId: string, gesture: any) {
    this.publish('gesture_recognized', {
      sceneId,
      userId,
      gesture,
      timestamp: Date.now()
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
  }
}

export const collaborationService = CollaborationService.getInstance()