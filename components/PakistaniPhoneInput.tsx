'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaPhone, FaCheck, FaTimes } from 'react-icons/fa'
import { 
  validatePakistaniPhone, 
  displayPakistaniPhone, 
  getPhoneValidationError,
  getPakistaniCarrier 
} from '@/lib/phoneValidation'

interface PakistaniPhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidChange?: (isValid: boolean) => void
  required?: boolean
  disabled?: boolean
  className?: string
  label?: string
  showCarrier?: boolean
  placeholder?: string
}

export default function PakistaniPhoneInput({
  value,
  onChange,
  onValidChange,
  required = false,
  disabled = false,
  className = '',
  label = 'Phone Number',
  showCarrier = true,
  placeholder = '03XX-XXXXXXX'
}: PakistaniPhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [touched, setTouched] = useState(false)
  const [displayValue, setDisplayValue] = useState('')

  // Format the input value for display
  const formatInput = useCallback((input: string): string => {
    // Remove all non-digits
    let digits = input.replace(/\D/g, '')
    
    // Handle +92 prefix
    if (input.startsWith('+92')) {
      digits = '0' + digits.slice(2)
    }
    
    // Limit to 11 digits (03XX-XXXXXXX)
    digits = digits.slice(0, 11)
    
    // Format as 03XX-XXXXXXX
    if (digits.length > 4) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`
    }
    
    return digits
  }, [])

  // Update display value when value prop changes
  useEffect(() => {
    setDisplayValue(formatInput(value))
  }, [value, formatInput])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const formatted = formatInput(rawValue)
    setDisplayValue(formatted)
    
    // Store the raw digits (without formatting)
    const digits = formatted.replace(/\D/g, '')
    onChange(digits)
    
    // Notify parent of validity
    if (onValidChange) {
      onValidChange(validatePakistaniPhone(digits))
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    setTouched(true)
    
    // Format on blur
    if (value) {
      setDisplayValue(displayPakistaniPhone(value))
    }
  }

  const isValid = !value || validatePakistaniPhone(value)
  const error = touched && value ? getPhoneValidationError(value) : null
  const carrier = value && isValid ? getPakistaniCarrier(value) : null

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Pakistan flag and prefix */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-lg">🇵🇰</span>
          <span className="text-gray-500 text-sm">+92</span>
        </div>
        
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full pl-20 pr-10 py-2 border rounded-lg transition-colors
            ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
            ${error ? 'border-red-500 focus:ring-red-500' : 
              isFocused ? 'border-cyan-600 ring-2 ring-cyan-200' : 'border-gray-300'}
            focus:outline-none
          `}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
        />
        
        {/* Validation indicator */}
        {touched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <FaCheck className="text-cyan-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p id="phone-error" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
      
      {/* Carrier info */}
      {showCarrier && carrier && isValid && (
        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <FaPhone className="text-cyan-500" />
          {carrier} Network
        </p>
      )}
    </div>
  )
}

