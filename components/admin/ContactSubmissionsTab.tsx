'use client'

import { useState, useEffect } from 'react'
import { FaEnvelope, FaPhone, FaUser, FaCalendar, FaEye, FaTrash, FaCheckCircle, FaSync, FaEnvelopeOpen } from 'react-icons/fa'

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function ContactSubmissionsTab() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    fetchContacts()
  }, [filter])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const onlyUnread = filter === 'unread' ? 'true' : 'false'
      const response = await fetch(`/api/admin/contact?limit=100&onlyUnread=${onlyUnread}`)
      const data = await response.json()

      if (response.ok && data.contacts) {
        let filteredContacts = data.contacts
        if (filter === 'read') {
          filteredContacts = data.contacts.filter((c: Contact) => c.isRead)
        }
        setContacts(filteredContacts)
      } else {
        console.error('Error fetching contacts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewContact = async (contact: Contact) => {
    setSelectedContact(contact)
    setShowDetail(true)

    // Mark as read if not already
    if (!contact.isRead) {
      try {
        await fetch('/api/admin/contact', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactId: contact.id, isRead: true }),
        })
        // Update local state
        setContacts(contacts.map(c => 
          c.id === contact.id ? { ...c, isRead: true } : c
        ))
      } catch (error) {
        console.error('Error marking contact as read:', error)
      }
    }
  }

  const handleToggleRead = async (contact: Contact) => {
    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id, isRead: !contact.isRead }),
      })

      if (response.ok) {
        setContacts(contacts.map(c => 
          c.id === contact.id ? { ...c, isRead: !c.isRead } : c
        ))
        if (selectedContact?.id === contact.id) {
          setSelectedContact({ ...contact, isRead: !contact.isRead })
        }
      }
    } catch (error) {
      console.error('Error toggling read status:', error)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/contact?contactId=${contactId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== contactId))
        if (selectedContact?.id === contactId) {
          setShowDetail(false)
          setSelectedContact(null)
        }
        alert('Contact submission deleted successfully')
      } else {
        alert('Failed to delete contact submission')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact submission')
    }
  }

  const unreadCount = contacts.filter(c => !c.isRead).length

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Form Submissions</h2>
          <p className="text-gray-600 mt-1">
            {contacts.length} total submissions • {unreadCount} unread
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({contacts.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'unread'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 font-medium transition ${
            filter === 'read'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Read ({contacts.length - unreadCount})
        </button>
      </div>

      {/* Contact List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <FaSync className="text-4xl mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading contact submissions...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Contact Submissions</h3>
            <p className="text-sm">
              {filter === 'unread'
                ? 'No unread submissions at the moment.'
                : filter === 'read'
                ? 'No read submissions yet.'
                : 'No contact form submissions yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                  !contact.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1" onClick={() => handleViewContact(contact)}>
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser className="text-gray-400" />
                      <p className={`font-semibold ${!contact.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                        {contact.name}
                      </p>
                      {!contact.isRead && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <FaEnvelope className="text-gray-400" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1">
                          <FaPhone className="text-gray-400" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Subject: {contact.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contact.message.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaCalendar />
                      {new Date(contact.createdAt).toLocaleDateString()} {new Date(contact.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewContact(contact)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleRead(contact)
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded transition"
                        title={contact.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        {contact.isRead ? <FaEnvelopeOpen /> : <FaCheckCircle />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(contact.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showDetail && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Submission Details</h3>
                <div className="flex items-center gap-2">
                  {selectedContact.isRead ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Read
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Unread
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Submitted on {new Date(selectedContact.createdAt).toLocaleDateString()} at {new Date(selectedContact.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{selectedContact.name}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedContact.email}
                  </a>
                </div>

                {selectedContact.phone && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900">{selectedContact.subject}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => handleToggleRead(selectedContact)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                {selectedContact.isRead ? <FaEnvelope /> : <FaCheckCircle />}
                Mark as {selectedContact.isRead ? 'Unread' : 'Read'}
              </button>
              <button
                onClick={() => handleDelete(selectedContact.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

