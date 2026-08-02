import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group messages by conversation (other user + property)
    const conversationsMap = new Map()

    messages.forEach((message) => {
      // Determine the other user in the conversation
      const otherUser = message.senderId === userId ? message.receiver : message.sender
      
      // Create a unique key for this conversation
      const conversationKey = `${otherUser.id}-${message.propertyId || 'general'}`
      
      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          otherUser,
          property: message.property,
          messages: [],
          lastMessageAt: message.createdAt,
          unreadCount: 0,
        })
      }
      
      const conversation = conversationsMap.get(conversationKey)
      conversation.messages.push(message)
      
      // Count unread messages (received by current user and not read)
      if (message.receiverId === userId && !message.isRead) {
        conversation.unreadCount++
      }
      
      // Update last message time if this message is more recent
      if (new Date(message.createdAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessageAt = message.createdAt
      }
    })

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

