import { describe, it, expect } from 'vitest'
import { cropPosition, cropPreviewStyle, shouldFitFrame } from '@/utils/image_crop'

describe('cropPosition', () => {
    it('returns undefined for null', () => {
        expect(cropPosition(null)).toBeUndefined()
    })

    it('returns undefined for undefined', () => {
        expect(cropPosition(undefined)).toBeUndefined()
    })

    it('returns center for full-image crop', () => {
        expect(cropPosition({ x: 0, y: 0, width: 100, height: 100 })).toBe('50% 50%')
    })

    it('returns focal point for offset crop', () => {
        // focal = (10 + 40/2)% , (20 + 30/2)% = 30% 35%
        expect(cropPosition({ x: 10, y: 20, width: 40, height: 30 })).toBe('30% 35%')
    })

    it('returns top-left quadrant focal point', () => {
        expect(cropPosition({ x: 0, y: 0, width: 50, height: 50 })).toBe('25% 25%')
    })

    it('returns bottom-right quadrant focal point', () => {
        expect(cropPosition({ x: 50, y: 50, width: 50, height: 50 })).toBe('75% 75%')
    })

    it('returns undefined for partial object missing width/height', () => {
        expect(cropPosition({ x: 10, y: 20 })).toBeUndefined()
    })

    it('handles rotate field without affecting position', () => {
        expect(cropPosition({ x: 10, y: 20, width: 80, height: 60, rotate: 90 })).toBe('50% 50%')
    })
})

describe('cropPreviewStyle', () => {
    const SRC = '/media/foo.jpg'

    it('returns plain cover when src is empty', () => {
        const s = cropPreviewStyle('', { x: 10, y: 20, width: 50, height: 50, fit: 1 })
        expect(s.backgroundSize).toBe('cover')
        expect(s.backgroundPosition).toBe('center')
    })

    it('returns plain cover when cropData is null', () => {
        const s = cropPreviewStyle(SRC, null)
        expect(s.backgroundImage).toBe(`url("${SRC}")`)
        expect(s.backgroundSize).toBe('cover')
        expect(s.backgroundPosition).toBe('center')
    })

    it('returns cover with focal point when fit is unset and forceCrop=false', () => {
        const s = cropPreviewStyle(SRC, { x: 10, y: 20, width: 40, height: 30 })
        expect(s.backgroundSize).toBe('cover')
        // focal = (10 + 20)% , (20 + 15)% = 30% 35%
        expect(s.backgroundPosition).toBe('30% 35%')
        expect(s.backgroundRepeat).toBeUndefined()
    })

    it('returns zoom-into-crop when forceCrop=true regardless of fit', () => {
        const s = cropPreviewStyle(SRC, { x: 10, y: 20, width: 50, height: 50 }, true)
        // bgSize = 100/50 = 200%
        expect(s.backgroundSize).toBe('200%')
        // pos = clamp(10+25), clamp(20+25) = 35% 45%
        expect(s.backgroundPosition).toBe('35% 45%')
        expect(s.backgroundRepeat).toBe('no-repeat')
    })

    it('returns zoom-into-crop when fit=true and forceCrop=false', () => {
        const s = cropPreviewStyle(SRC, { x: 0, y: 0, width: 50, height: 50, fit: 1 })
        expect(s.backgroundSize).toBe('200%')
        expect(s.backgroundPosition).toBe('25% 25%')
        expect(s.backgroundRepeat).toBe('no-repeat')
    })

    it('clamps focal positions to [0, 100]', () => {
        const s = cropPreviewStyle(SRC, { x: 90, y: 90, width: 50, height: 50 }, true)
        // pos = clamp(90+25)=100, clamp(90+25)=100
        expect(s.backgroundPosition).toBe('100% 100%')
    })
})

describe('shouldFitFrame', () => {
    it('returns false for null/undefined cropData', () => {
        expect(shouldFitFrame(null)).toBe(false)
        expect(shouldFitFrame(undefined)).toBe(false)
    })

    it('returns false when fit flag is unset', () => {
        expect(shouldFitFrame({ x: 0, y: 0, width: 50, height: 50 })).toBe(false)
    })

    it('returns true when fit flag is set and forceCrop=false', () => {
        expect(shouldFitFrame({ x: 0, y: 0, width: 50, height: 50, fit: 1 })).toBe(true)
    })

    it('returns false when forceCrop=true (caller already cropping)', () => {
        expect(shouldFitFrame({ x: 0, y: 0, width: 50, height: 50, fit: 1 }, true)).toBe(false)
    })
})
