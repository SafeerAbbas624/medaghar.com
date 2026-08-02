'use client'

import { useState, useEffect } from 'react'
import { FaEnvelope, FaPaperPlane, FaInbox, FaTrash, FaReply, FaCog, FaSync, FaEye } from 'react-icons/fa'

interface Email {
  id: string
  from: string
  to: string[]
  subject: string
  date: string
  text?: string
  html?: string
  attachments: Array<{
    filename: string
    contentType: string
    size: number
  }>
}

export default function EmailManagementTab() {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox')
  const [showCompose, setShowCompose] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showEmailDetail, setShowEmailDetail] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emails, setEmails] = useState<Email[]>([])
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    text: '',
    html: '',
  })
  const [emailConfig, setEmailConfig] = useState({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    user: 'info@medaghar.com',
    password: '',
  })

  const folders = [
    { id: 'inbox' as const, name: 'Inbox', icon: <FaInbox />, count: emails.filter(e => activeFolder === 'inbox').length },
    { id: 'sent' as const, name: 'Sent', icon: <FaPaperPlane />, count: emails.filter(e => activeFolder === 'sent').length },
    { id: 'drafts' as const, name: 'Drafts', icon: <FaEnvelope />, count: 0 },
    { id: 'trash' as const, name: 'Trash', icon: <FaTrash />, count: 0 },
  ]

  useEffect(() => {
    fetchEmailConfig()
    fetchEmails()
  }, [])

  useEffect(() => {
    fetchEmails()
  }, [activeFolder])

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch('/api/admin/email/config')
      const data = await response.json()
      if (data.config) {
        setEmailConfig({ ...emailConfig, ...data.config })
      }
    } catch (error) {
      console.error('Error fetching email config:', error)
    }
  }

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/email/fetch?folder=${activeFolder}&limit=50`)
      const data = await response.json()

      if (response.ok && data.emails) {
        setEmails(data.emails)
        console.log(`✅ Fetched ${data.count} emails from ${data.folder}`)
      } else {
        console.error('Error fetching emails:', data.error)
        if (data.hint) {
          console.log('Hint:', data.hint)
        }
        setEmails([])
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          text: composeData.text,
          html: composeData.html || `<p>${composeData.text.replace(/\n/g, '<br>')}</p>`,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setShowCompose(false)
        setComposeData({ to: '', subject: '', text: '', html: '' })
        alert('Email sent successfully!')
        // Refresh emails if on sent folder
        if (activeFolder === 'sent') {
          fetchEmails()
        }
      } else {
        alert(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/admin/email/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig),
      })

      const result = await response.json()

      if (response.ok) {
        setShowConfig(false)
        alert('Email configuration saved and verified!')
      } else {
        alert(result.error || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Email Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <FaCog />
            <span>Configure</span>
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPaperPlane />
            <span>Compose Email</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Folders Sidebar */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
          <div className="space-y-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  activeFolder === folder.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {folder.icon}
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="col-span-9 bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <FaSync className="text-4xl mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No Emails</h3>
              <p className="text-sm">
                Your {activeFolder} is empty. Click "Compose Email" to send a new message.
              </p>
              <p className="text-sm mt-2 text-blue-600">
                ✓ Email sending is configured and ready to use
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email)
                    setShowEmailDetail(true)
                  }}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{email.from}</p>
                      <p className="text-sm text-gray-600 mt-1">{email.subject}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">
                        {new Date(email.date).toLocaleDateString()} {new Date(email.date).toLocaleTimeString()}
                      </p>
                      {email.attachments.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          📎 {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {email.text?.substring(0, 100) || '(No preview available)'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Compose Email</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="email"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={composeData.text}
                  onChange={(e) => setComposeData({ ...composeData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={10}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaPaperPlane />
                  <span>{sending ? 'Sending...' : 'Send Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompose(false)
                    setComposeData({ to: '', subject: '', text: '', html: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Configuration</h3>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={emailConfig.host}
                  onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.hostinger.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={emailConfig.port}
                    onChange={(e) => setEmailConfig({ ...emailConfig, port: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secure (SSL/TLS)</label>
                  <select
                    value={emailConfig.secure ? 'true' : 'false'}
                    onChange={(e) => setEmailConfig({ ...emailConfig, secure: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Yes (SSL/TLS)</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailConfig.user}
                  onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="info@medaghar.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={emailConfig.password}
                  onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email password"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> For Hostinger email, use your full email address as the username and your email password.
                  Default port is 465 for SSL/TLS.
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save & Verify
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {showEmailDetail && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEmail.subject}</h3>
                <p className="text-sm text-gray-600">
                  <strong>From:</strong> {selectedEmail.from}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>To:</strong> {selectedEmail.to.join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(selectedEmail.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEmailDetail(false)
                  setSelectedEmail(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedEmail.attachments.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Attachments:</p>
                <div className="space-y-1">
                  {selectedEmail.attachments.map((att, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      📎 {att.filename} ({(att.size / 1024).toFixed(2)} KB)
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              {selectedEmail.html ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedEmail.text || '(No content)'}
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => {
                  setComposeData({
                    to: selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from,
                    subject: `Re: ${selectedEmail.subject}`,
                    text: `\n\n--- Original Message ---\n${selectedEmail.text || ''}`,
                    html: '',
                  })
                  setShowEmailDetail(false)
                  setShowCompose(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaReply />
                <span>Reply</span>
              </button>
              <button
                onClick={() => {
                  setShowEmailDetail(false)
                  setSelectedEmail(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

