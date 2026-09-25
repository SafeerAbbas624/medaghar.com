import { describe, it, expect } from 'vitest'
import { minImagesFor, imageCountError } from '@/lib/imageRules'

describe('image rules', () => {
  it('requires more photos for a house than a plot file', () => {
    expect(minImagesFor('HOUSE')).toBe(5)
    expect(minImagesFor('PLOT_FILE')).toBe(1)
  })

  it('falls back to the default for unknown or missing types', () => {
    expect(minImagesFor(undefined)).toBe(3)
    expect(minImagesFor('SOMETHING_NEW')).toBe(3)
  })

  it('returns null once the minimum is met', () => {
    expect(imageCountError('FLAT', 4)).toBeNull()
  })

  it('uses singular wording when one photo is missing', () => {
    expect(imageCountError('FLAT', 3)).toContain('1 more is needed')
    expect(imageCountError('FLAT', 1)).toContain('3 more are needed')
  })
})
