/**
 * Pakistani Phone Number Validation Utility
 * Supports formats: +923001234567, 03001234567, 0300-1234567, 0300 1234567
 */

// Pakistani mobile number regex
// Matches: +92 3XX XXXXXXX, 03XX XXXXXXX, 03XX-XXXXXXX
export const PAKISTAN_MOBILE_REGEX = /^(\+92|0)?3[0-9]{2}[-\s]?[0-9]{7}$/

// Pakistani landline regex (optional - for future use)
export const PAKISTAN_LANDLINE_REGEX = /^(\+92|0)?[1-9][0-9]{1,2}[-\s]?[0-9]{7,8}$/

/**
 * Validate if a phone number is a valid Pakistani mobile number
 */
export function validatePakistaniPhone(phone: string): boolean {
  if (!phone) return true // Empty is valid (optional field)
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return PAKISTAN_MOBILE_REGEX.test(cleaned)
}

/**
 * Format phone number to international format (+92...)
 */
export function formatPakistaniPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // Already in international format
  if (cleaned.startsWith('+92')) {
    return cleaned
  }
  
  // Convert 03XX to +923XX
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.slice(1)
  }
  
  // Just digits starting with 3
  if (cleaned.startsWith('3')) {
    return '+92' + cleaned
  }
  
  return cleaned
}

/**
 * Format phone number for display: 03XX-XXXXXXX
 */
export function displayPakistaniPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // Convert +92 to 0
  let digits = cleaned.replace(/^\+92/, '0')
  
  // If it starts with 3, add 0
  if (digits.startsWith('3')) {
    digits = '0' + digits
  }
  
  // Format as 03XX-XXXXXXX
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  
  return phone
}

/**
 * Get phone number validation error message
 */
export function getPhoneValidationError(phone: string): string | null {
  if (!phone) return null
  
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  if (!PAKISTAN_MOBILE_REGEX.test(cleaned)) {
    return 'Please enter a valid Pakistani mobile number (03XX-XXXXXXX)'
  }
  
  return null
}

/**
 * Extract carrier from Pakistani mobile number
 */
export function getPakistaniCarrier(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-()]/g, '').replace(/^\+92/, '0')
  
  const prefix = cleaned.slice(0, 4)
  
  const carriers: Record<string, string> = {
    '0300': 'Jazz', '0301': 'Jazz', '0302': 'Jazz', '0303': 'Jazz', '0304': 'Jazz', '0305': 'Jazz', '0306': 'Jazz', '0307': 'Jazz', '0308': 'Jazz', '0309': 'Jazz',
    '0310': 'Zong', '0311': 'Zong', '0312': 'Zong', '0313': 'Zong', '0314': 'Zong', '0315': 'Zong', '0316': 'Zong', '0317': 'Zong', '0318': 'Zong', '0319': 'Zong',
    '0320': 'Jazz', '0321': 'Jazz', '0322': 'Jazz', '0323': 'Jazz', '0324': 'Jazz', '0325': 'Jazz',
    '0330': 'Ufone', '0331': 'Ufone', '0332': 'Ufone', '0333': 'Ufone', '0334': 'Ufone', '0335': 'Ufone', '0336': 'Ufone', '0337': 'Ufone',
    '0340': 'Telenor', '0341': 'Telenor', '0342': 'Telenor', '0343': 'Telenor', '0344': 'Telenor', '0345': 'Telenor', '0346': 'Telenor', '0347': 'Telenor',
    '0350': 'SCO',
    '0360': 'Telenor', '0361': 'Telenor', '0362': 'Telenor', '0363': 'Telenor'
  }
  
  return carriers[prefix] || null
}

