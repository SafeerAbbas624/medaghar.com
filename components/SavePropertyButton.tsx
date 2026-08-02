'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

interface SavePropertyButtonProps {
  propertyId: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SavePropertyButton({ propertyId, size = 'md' }: SavePropertyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      checkIfSaved()
    }
  }, [session, propertyId])

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`/api/saved-properties/check?propertyId=${propertyId}`)
      const data = await response.json()
      setIsSaved(data.isSaved)
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const handleSave = async () => {
    if (!session?.user) {
      router.push('/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-properties?propertyId=${propertyId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsSaved(false)
        } else {
          alert('Failed to remove property from saved list')
        }
      } else {
        // Save
        const response = await fetch('/api/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId }),
        })
        
        if (response.ok) {
          setIsSaved(true)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to save property')
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  const iconSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`${sizeClasses[size]} bg-white border-2 border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition disabled:opacity-50 flex items-center gap-2 font-semibold`}
      title={isSaved ? 'Remove from saved' : 'Save property'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
      ) : isSaved ? (
        <FaHeart className={`${iconSizes[size]} text-red-500`} />
      ) : (
        <FaRegHeart className={iconSizes[size]} />
      )}
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  )
}

