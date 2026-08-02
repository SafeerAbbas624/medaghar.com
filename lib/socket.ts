import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

let io: SocketIOServer | null = null

export function getSocketIO(): SocketIOServer | null {
  return io
}

export function initSocketServer(httpServer: ReturnType<typeof createServer>) {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXTAUTH_URL || 'https://medaghar.com',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get session from cookie or token
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

      if (!token) {
        return next(new Error('Authentication required'))
      }

      // Verify JWT token (simplified - in production use proper JWT verification)
      const { verify } = await import('jsonwebtoken')
      const secret = process.env.NEXTAUTH_SECRET
      if (!secret) return next(new Error('Server configuration error'))

      const decoded = verify(token, secret) as { id: string; email: string; role: string }
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    console.log(`User connected: ${user.email} (${user.id})`)

    // Join user's personal room for direct messages
    socket.join(`user:${user.id}`)

    // Join admin room if user is admin
    if (user.role === 'ADMIN') {
      socket.join('admin')
    }

    // Handle joining property-specific rooms
    socket.on('join:property', (propertyId: string) => {
      socket.join(`property:${propertyId}`)
    })

    socket.on('leave:property', (propertyId: string) => {
      socket.leave(`property:${propertyId}`)
    })

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`)
    })

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Handle typing indicators
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId: user.id,
        userName: socket.handshake.auth.userName,
      })
    })

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId: user.id,
      })
    })

    // Handle message read receipts
    socket.on('message:read', async (data: { messageId: string; conversationId: string }) => {
      try {
        await prisma.message.update({
          where: { id: data.messageId },
          data: { isRead: true },
        })

        io?.to(`conversation:${data.conversationId}`).emit('message:read', {
          messageId: data.messageId,
          readBy: user.id,
          readAt: new Date(),
        })
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    })

    // Handle new message broadcast
    socket.on('message:new', (data: {
      conversationId: string
      message: any
    }) => {
      io?.to(`conversation:${data.conversationId}`).emit('message:new', data.message)
    })

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${user.email} - ${reason}`)
    })

    socket.on('error', (error) => {
      console.error(`Socket error for ${user.email}:`, error)
    })
  })

  return io
}

// Server-side functions to emit events
export const socketEvents = {
  // Notify user of new message
  newMessage: (receiverId: string, message: any) => {
    io?.to(`user:${receiverId}`).emit('notification:message', {
      type: 'new_message',
      message,
      timestamp: new Date(),
    })
  },

  // Notify user of property inquiry
  newInquiry: (ownerId: string, inquiry: any) => {
    io?.to(`user:${ownerId}`).emit('notification:inquiry', {
      type: 'property_inquiry',
      inquiry,
      timestamp: new Date(),
    })
  },

  // Notify agent of tour request
  newTourRequest: (agentId: string, tourRequest: any) => {
    io?.to(`user:${agentId}`).emit('notification:tour', {
      type: 'tour_request',
      tourRequest,
      timestamp: new Date(),
    })
  },

  // Broadcast to all admins
  adminNotification: (notification: any) => {
    io?.to('admin').emit('admin:notification', notification)
  },

  // Property status update
  propertyStatusChange: (propertyId: string, status: string) => {
    io?.to(`property:${propertyId}`).emit('property:status', { propertyId, status })
  },

  // New review
  newReview: (propertyId: string, review: any) => {
    io?.to(`property:${propertyId}`).emit('review:new', review)
  },

  // Saved property notification
  propertySaved: (userId: string, propertyId: string) => {
    io?.to(`user:${userId}`).emit('notification:saved', { propertyId })
  },

  // Price drop alert
  priceDropAlert: (userId: string, propertyId: string, newPrice: number) => {
    io?.to(`user:${userId}`).emit('alert:price_drop', { propertyId, newPrice })
  },
}