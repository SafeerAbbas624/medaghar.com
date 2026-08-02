import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { receiverId, receiverEmail, subject, content, propertyId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    let receiver

    // Find receiver by ID or email
    if (receiverId) {
      receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      })
    } else if (receiverEmail) {
      receiver = await prisma.user.findUnique({
        where: { email: receiverEmail },
      })
    } else {
      return NextResponse.json(
        { error: 'Receiver ID or email is required' },
        { status: 400 }
      )
    }

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      )
    }

    // Cannot send message to yourself
    if (receiver.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: receiver.id,
        subject: subject || 'Chat message',
        content,
        propertyId: propertyId || null,
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
          },
        },
        property: {
          select: {
            id: true,
            address: true,
            city: true,
          },
        },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

