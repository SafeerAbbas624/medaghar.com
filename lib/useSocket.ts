'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface Notification {
  type: string
  message?: any
  inquiry?: any
  tourRequest?: any
  tourRequestId?: string
  review?: any
  propertyId?: string
  status?: string
  timestamp: Date
}

interface UseSocketOptions {
  onNewMessage?: (message: any) => void
  onNewInquiry?: (inquiry: any) => void
  onNewTourRequest?: (tour: any) => void
  onNotification?: (notification: Notification) => void
  onTypingStart?: (data: { userId: string; userName: string }) => void
  onTypingStop?: (data: { userId: string }) => void
  onMessageRead?: (data: { messageId: string; readBy: string; readAt: Date }) => void
  onPropertyStatusChange?: (data: { propertyId: string; status: string }) => void
  onNewReview?: (review: any) => void
  onPriceDropAlert?: (data: { propertyId: string; newPrice: number }) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return

    // Initialize socket connection
    const socket = io(process.env.NEXTAUTH_URL || window.location.origin, {
      path: '/api/socket',
      auth: {
        token: session.user.id || session.user.email, // Use user ID as token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      setConnectionError(null)
      console.log('Socket connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      console.log('Socket disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      setConnectionError(error.message)
      console.error('Socket connection error:', error)
    })

    // Notification handlers
    socket.on('notification:message', (data) => {
      options.onNewMessage?.(data.message)
      options.onNotification?.(data)
    })

    socket.on('notification:inquiry', (data) => {
      options.onNewInquiry?.(data.inquiry)
      options.onNotification?.(data)
    })

    socket.on('notification:tour', (data) => {
      options.onNewTourRequest?.(data.tourRequest)
      options.onNotification?.(data)
    })

    socket.on('notification:saved', (data) => {
      options.onNotification?.({ type: 'property_saved', ...data, timestamp: new Date() })
    })

    // Message events
    socket.on('message:new', (data) => {
      options.onNewMessage?.(data.message)
    })

    socket.on('message:read', (data) => {
      options.onMessageRead?.(data)
    })

    // Typing indicators
    socket.on('typing:start', (data) => {
      options.onTypingStart?.(data)
    })

    socket.on('typing:stop', (data) => {
      options.onTypingStop?.(data)
    })

    // Property events
    socket.on('property:status', (data) => {
      options.onPropertyStatusChange?.(data)
    })

    // Review events
    socket.on('review:new', (data) => {
      options.onNewReview?.(data)
    })

    // Price alerts
    socket.on('alert:price_drop', (data) => {
      options.onPriceDropAlert?.(data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session?.user])

  // Emit functions
  const joinProperty = useCallback((propertyId: string) => {
    socketRef.current?.emit('join:property', propertyId)
  }, [])

  const leaveProperty = useCallback((propertyId: string) => {
    socketRef.current?.emit('leave:property', propertyId)
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join:conversation', conversationId)
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave:conversation', conversationId)
  }, [])

  const sendTypingStart = useCallback((conversationId: string, userName: string) => {
    socketRef.current?.emit('typing:start', { conversationId, userName })
  }, [])

  const sendTypingStop = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId })
  }, [])

  const markMessageRead = useCallback((messageId: string, conversationId: string) => {
    socketRef.current?.emit('message:read', { messageId, conversationId })
  }, [])

  const sendMessage = useCallback((conversationId: string, message: any) => {
    socketRef.current?.emit('message:new', { conversationId, message })
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    joinProperty,
    leaveProperty,
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markMessageRead,
    sendMessage,
  }
}