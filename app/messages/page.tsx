'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaUser, FaHome, FaPaperPlane, FaArrowLeft
} from 'react-icons/fa'

interface Message {
  id: string
  subject: string
  content: string
  isRead: boolean
  createdAt: string
  senderId: string
  receiverId: string
  sender: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  receiver: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  property: {
    id: string
    address: string
    city: string
    price: number
  } | null
}

interface Conversation {
  otherUser: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  property: {
    id: string
    address: string
    city: string
    price: number
  } | null
  messages: Message[]
  lastMessageAt: string
  unreadCount: number
}

function MessagesContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/messages')
      return
    }

    if (status === 'authenticated') {
      loadConversations()
    }
  }, [status, router])

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && session?.user?.id) {
      markConversationAsRead(selectedConversation)
    }
  }, [selectedConversation, session])

  // Handle URL parameters to open specific conversation
  useEffect(() => {
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const prePopulatedMessage = searchParams.get('message')

    if (userId && !loading) {
      // Find conversation with this user and property
      const conversation = conversations.find(c =>
        c.otherUser.id === userId &&
        (propertyId ? c.property?.id === propertyId : true)
      )

      if (conversation) {
        setSelectedConversation(conversation)
        // Set pre-populated message if provided
        if (prePopulatedMessage) {
          setNewMessage(decodeURIComponent(prePopulatedMessage))
        }
      } else if (conversations.length > 0 || !loading) {
        // Create a new conversation placeholder if conversations are loaded
        createNewConversation(userId, propertyId, prePopulatedMessage)
      }
    }
  }, [conversations, searchParams, loading])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewConversation = async (userId: string, propertyId: string | null, prePopulatedMessage?: string | null) => {
    try {
      // Fetch user details
      const userResponse = await fetch(`/api/users/${userId}`)
      if (!userResponse.ok) return

      const userData = await userResponse.json()

      let propertyData = null
      if (propertyId) {
        const propResponse = await fetch(`/api/properties/${propertyId}`)
        if (propResponse.ok) {
          const propJson = await propResponse.json()
          // API returns property directly, not wrapped in { property: ... }
          propertyData = {
            id: propJson.id,
            address: propJson.address,
            city: propJson.city,
            price: propJson.price,
          }
        }
      }

      const newConv: Conversation = {
        otherUser: userData.user,
        property: propertyData,
        messages: [],
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      }

      setSelectedConversation(newConv)

      // Set pre-populated message if provided
      if (prePopulatedMessage) {
        setNewMessage(decodeURIComponent(prePopulatedMessage))
      }
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const markConversationAsRead = async (conversation: Conversation) => {
    try {
      // Find all unread messages from the other user in this conversation
      const unreadMessages = conversation.messages.filter(
        msg => !msg.isRead && msg.receiverId === session?.user?.id
      )

      // Mark each unread message as read
      for (const message of unreadMessages) {
        await fetch(`/api/messages/${message.id}/read`, {
          method: 'PATCH',
        })
      }

      // Update local state to reflect read status
      if (unreadMessages.length > 0) {
        setConversations(prevConversations =>
          prevConversations.map(conv => {
            if (
              conv.otherUser.id === conversation.otherUser.id &&
              conv.property?.id === conversation.property?.id
            ) {
              return {
                ...conv,
                messages: conv.messages.map(msg => ({
                  ...msg,
                  isRead: msg.receiverId === session?.user?.id ? true : msg.isRead,
                })),
                unreadCount: 0,
              }
            }
            return conv
          })
        )

        // Also update selected conversation
        setSelectedConversation(prev => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map(msg => ({
              ...msg,
              isRead: msg.receiverId === session?.user?.id ? true : msg.isRead,
            })),
            unreadCount: 0,
          }
        })
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedConversation.otherUser.id,
          content: newMessage,
          propertyId: selectedConversation.property?.id || null,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Reload conversations to get the new message
        await loadConversations()
        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else {
        alert('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Removed auto-scroll on conversation selection to prevent unwanted scrolling

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="bg-slate-50 py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Messages</h1>
          <p className="text-sm md:text-base text-gray-600">Your conversations with agents, buyers, and sellers</p>
        </div>

        {/* Messages Container - Fixed height that won't overlap footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '500px' }}>
          {/* Conversations List */}
          <div className="lg:col-span-1 min-h-0">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaUser className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Start chatting by contacting an agent from a property listing</p>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <button
                      key={`${conversation.otherUser.id}-${conversation.property?.id || 'general'}-${index}`}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 border-b border-gray-100 text-left hover:bg-slate-50 transition ${
                        selectedConversation?.otherUser.id === conversation.otherUser.id &&
                        selectedConversation?.property?.id === conversation.property?.id
                          ? 'bg-cyan-50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {conversation.otherUser.avatar ? (
                            <Image
                              src={conversation.otherUser.avatar}
                              alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-cyan-600 text-xl" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                            </p>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          {conversation.property && (
                            <p className="text-xs text-gray-600 truncate flex items-center gap-1 mb-1">
                              <FaHome className="text-xs flex-shrink-0" />
                              {conversation.property.address}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.messages[0]?.content || 'No messages'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-block mt-1 bg-cyan-700 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 min-h-0">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden text-gray-600 hover:text-gray-900"
                    >
                      <FaArrowLeft />
                    </button>
                    {selectedConversation.otherUser.avatar ? (
                      <Image
                        src={selectedConversation.otherUser.avatar}
                        alt={`${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-cyan-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                      </h2>
                      {selectedConversation.property && (
                        <Link
                          href={`/properties/${selectedConversation.property.id}`}
                          className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                        >
                          <FaHome className="text-xs" />
                          {selectedConversation.property.address}, {selectedConversation.property.city}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedConversation.messages
                      .slice()
                      .reverse()
                      .map((message) => {
                        const isCurrentUser = message.senderId === session?.user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser
                                  ? 'bg-cyan-700 text-white'
                                  : 'bg-slate-100 text-gray-900'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? 'text-slate-300' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-slate-50 flex-shrink-0">
                  {selectedConversation.property && (
                    <div className="mb-3 bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <FaHome className="text-cyan-600" />
                        <span className="text-gray-600">Regarding:</span>
                        <Link
                          href={`/properties/${selectedConversation.property.id}`}
                          className="text-cyan-600 hover:text-cyan-700 font-medium flex-1 truncate"
                        >
                          {selectedConversation.property.address} - PKR {selectedConversation.property.price.toLocaleString()}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      rows={2}
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-cyan-700 text-white px-6 py-2 rounded-lg hover:bg-cyan-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaPaperPlane />
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center h-full flex flex-col items-center justify-center">
                <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-600">
                  Select a conversation from the list to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}

