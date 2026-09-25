import { describe, it, expect } from 'vitest'
import { normalizeAddress, areAddressesDuplicates, levenshteinDistance } from '@/lib/addressNormalization'

describe('address normalization', () => {
  it('is independent of word order, punctuation and abbreviations', () => {
    expect(normalizeAddress('House 12, Street 5, Block A', 'Lahore')).toBe(
      normalizeAddress('Block A St 5 H 12', 'lahore')
    )
  })

  it('treats defence and defense as DHA', () => {
    expect(normalizeAddress('Defence Phase 6', 'Karachi')).toBe(normalizeAddress('DHA Ph 6', 'Karachi'))
  })

  it('computes edit distance', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3)
  })

  it('flags the same address in the same city as a duplicate', () => {
    expect(
      areAddressesDuplicates(
        { address: 'House 12, Street 5, Block A', city: 'Lahore', area: 'Gulberg' },
        { address: 'H 12 St 5 Blk A', city: 'lahore', area: 'Gulberg' }
      )
    ).toBe(true)
  })

  it('never flags addresses in different cities', () => {
    expect(
      areAddressesDuplicates(
        { address: 'House 12, Street 5', city: 'Lahore' },
        { address: 'House 12, Street 5', city: 'Karachi' }
      )
    ).toBe(false)
  })
})
