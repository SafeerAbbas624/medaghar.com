'use client'

import { useState } from 'react'
import HeroBg from '@/components/HeroBg'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })

      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white py-[55px] lg:py-[89px]">
        <HeroBg src="/images/cities/city-homes-2.jpg" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-[34px] sm:text-[55px] lg:text-[68px] font-bold mb-[21px]">
              Contact Us
            </h1>
            <p className="text-[16px] lg:text-[21px] text-slate-300 max-w-3xl mx-auto">
              We're here to help! Get in touch with our team
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[55px] lg:py-[89px]">
        <div className="grid lg:grid-cols-3 gap-[34px]">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-[21px]">
            {/* Email */}
            <div className="bg-white rounded-2xl shadow-lg p-[34px]">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[21px]">
                <FaEnvelope className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[21px] font-bold text-gray-900 mb-[13px]">Email</h3>
              <p className="text-[16px] text-gray-700 mb-[8px]">
                <a href="mailto:info@medaghar.com" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  info@medaghar.com
                </a>
              </p>
              <p className="text-[16px] text-gray-700">
                <a href="mailto:admin@medaghar.com" className="text-cyan-600 hover:text-cyan-700 hover:underline">
                  admin@medaghar.com
                </a>
              </p>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-[34px]">
              <div className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center mb-[21px]">
                <FaClock className="text-[21px] text-cyan-600" />
              </div>
              <h3 className="text-[21px] font-bold text-gray-900 mb-[13px]">Business Hours</h3>
              <p className="text-[16px] text-gray-700 mb-[8px]">
                <strong>Monday - Friday:</strong><br />
                9:00 AM - 6:00 PM
              </p>
              <p className="text-[16px] text-gray-700 mb-[8px]">
                <strong>Saturday:</strong><br />
                10:00 AM - 4:00 PM
              </p>
              <p className="text-[16px] text-gray-700">
                <strong>Sunday:</strong> Closed
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-[34px]">
              <h3 className="text-[21px] font-bold text-gray-900 mb-[21px]">Follow Us</h3>
              <div className="flex gap-[13px]">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center hover:bg-cyan-700 hover:text-white transition"
                >
                  <FaFacebook className="text-[21px]" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center hover:bg-cyan-700 hover:text-white transition"
                >
                  <FaTwitter className="text-[21px]" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center hover:bg-cyan-700 hover:text-white transition"
                >
                  <FaInstagram className="text-[21px]" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-cyan-100 w-[55px] h-[55px] rounded-full flex items-center justify-center hover:bg-cyan-700 hover:text-white transition"
                >
                  <FaLinkedin className="text-[21px]" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-[34px] lg:p-[55px]">
              <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[21px]">
                Send Us a Message
              </h2>
              <p className="text-[16px] text-gray-700 mb-[34px]">
                Have a question or feedback? Fill out the form below and we'll get back to you as soon as possible.
              </p>

              {submitted && (
                <div className="bg-cyan-100 border border-cyan-400 text-cyan-700 px-[21px] py-[13px] rounded-xl mb-[21px]">
                  <p className="text-[16px] font-medium">Thank you! Your message has been sent successfully. We will get back to you soon!</p>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-[21px] py-[13px] rounded-xl mb-[21px]">
                  <p className="text-[16px] font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-[21px]">
                <div className="grid md:grid-cols-2 gap-[21px]">
                  <div>
                    <label htmlFor="name" className="block text-[16px] font-medium text-gray-900 mb-[8px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px]"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[16px] font-medium text-gray-900 mb-[8px]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px]"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-[21px]">
                  <div>
                    <label htmlFor="phone" className="block text-[16px] font-medium text-gray-900 mb-[8px]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px]"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-[16px] font-medium text-gray-900 mb-[8px]">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px]"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="listing">Property Listing</option>
                      <option value="agent">Agent Services</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[16px] font-medium text-gray-900 mb-[8px]">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-[21px] py-[13px] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-[16px] resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-700 text-white px-[34px] py-[13px] rounded-xl hover:bg-cyan-800 transition font-medium text-[16px] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-[55px] lg:mt-[89px]">
          <h2 className="text-[26px] lg:text-[34px] font-bold text-gray-900 mb-[34px] text-center">
            Find Us on the Map
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[377px] lg:h-[610px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.8267607!2d73.0479!3d33.7077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQyJzI3LjciTiA3M8KwMDInNTIuNCJF!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

