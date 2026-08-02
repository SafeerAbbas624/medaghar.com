/**
 * Address Normalization Utility for Duplicate Detection
 * Normalizes Pakistani addresses for consistent comparison
 */

import crypto from 'crypto'

// Common abbreviations and their full forms
const ADDRESS_ABBREVIATIONS: Record<string, string> = {
  'street': 'st',
  'road': 'rd',
  'lane': 'ln',
  'avenue': 'ave',
  'block': 'blk',
  'house': 'h',
  'number': 'no',
  'plot': 'plt',
  'sector': 'sec',
  'phase': 'ph',
  'extension': 'ext',
  'society': 'soc',
  'town': 'twn',
  'garden': 'gdn',
  'colony': 'col',
  'apartment': 'apt',
  'floor': 'flr',
  'building': 'bldg',
  'commercial': 'comm',
  'residential': 'res',
  'defense': 'dha',
  'defence': 'dha',
  'bahria': 'bah',
  'gulberg': 'glb',
  'gulshan': 'gul',
  'nazimabad': 'nzb',
  'north': 'n',
  'south': 's',
  'east': 'e',
  'west': 'w',
}

/**
 * Normalize an address for comparison
 * Removes punctuation, standardizes abbreviations, converts to lowercase
 */
export function normalizeAddress(
  address: string,
  city: string,
  area?: string | null
): string {
  // Combine all parts
  let combined = [address, area, city]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .trim()

  // Remove punctuation and extra whitespace
  combined = combined
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with space
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim()

  // Replace full words with abbreviations
  const words = combined.split(' ')
  const normalizedWords = words.map(word => {
    return ADDRESS_ABBREVIATIONS[word] || word
  })

  // Remove common filler words
  const fillerWords = ['the', 'a', 'an', 'of', 'in', 'at', 'on', 'near', 'beside', 'opposite']
  const filteredWords = normalizedWords.filter(word => !fillerWords.includes(word))

  // Sort words for position-independent comparison
  // This helps match "Block A, Street 5" with "Street 5, Block A"
  const sortedWords = [...filteredWords].sort()

  return sortedWords.join(' ')
}

/**
 * Calculate MD5 hash of normalized address for quick comparison
 */
export function calculateAddressHash(normalizedAddress: string): string {
  return crypto
    .createHash('md5')
    .update(normalizedAddress)
    .digest('hex')
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of addresses
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length

  // Create a matrix to store distances
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // Initialize first column
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i
  }

  // Initialize first row
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Deletion
          dp[i][j - 1],     // Insertion
          dp[i - 1][j - 1]  // Substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate similarity percentage between two addresses
 * Returns a value between 0 and 100
 */
export function calculateAddressSimilarity(addr1: string, addr2: string): number {
  const normalized1 = normalizeAddress(addr1, '', '')
  const normalized2 = normalizeAddress(addr2, '', '')

  if (normalized1 === normalized2) return 100

  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)

  if (maxLength === 0) return 100

  const similarity = ((maxLength - distance) / maxLength) * 100
  return Math.round(similarity * 100) / 100
}

/**
 * Check if two addresses are likely duplicates
 * Returns true if similarity is above threshold (default 85%)
 */
export function areAddressesDuplicates(
  addr1: { address: string; city: string; area?: string | null },
  addr2: { address: string; city: string; area?: string | null },
  threshold: number = 85
): boolean {
  // First, check if cities match
  if (addr1.city.toLowerCase() !== addr2.city.toLowerCase()) {
    return false
  }

  // Normalize both addresses
  const normalized1 = normalizeAddress(addr1.address, addr1.city, addr1.area)
  const normalized2 = normalizeAddress(addr2.address, addr2.city, addr2.area)

  // Quick hash comparison first
  const hash1 = calculateAddressHash(normalized1)
  const hash2 = calculateAddressHash(normalized2)

  if (hash1 === hash2) return true

  // Fuzzy matching for near-duplicates
  const similarity = calculateAddressSimilarity(
    `${addr1.address} ${addr1.area || ''} ${addr1.city}`,
    `${addr2.address} ${addr2.area || ''} ${addr2.city}`
  )

  return similarity >= threshold
}

