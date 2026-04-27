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

    // CSS background-position percentage spec: P% positions the image so
    // that its P% point aligns with the container's P% point. With the
    // image scaled to (100/w)x of container, the formula to show the
    // crop region [x, x+w] is `posX = x / (100 - w) * 100`. Using the
    // focal-point formula (x + w/2) instead silently mis-positions the
    // visible region — the rendered output doesn't match the saved
    // selection (item 11 WYSIWYG bug).

    it('returns zoom-into-crop when forceCrop=true regardless of fit', () => {
        const s = cropPreviewStyle(SRC, { x: 10, y: 20, width: 50, height: 50 }, true)
        // bgSize = 100/50 = 200%
        expect(s.backgroundSize).toBe('200%')
        // pos = 10/(100-50)*100, 20/(100-50)*100 = 20% 40%
        expect(s.backgroundPosition).toBe('20% 40%')
        expect(s.backgroundRepeat).toBe('no-repeat')
    })

    it('returns zoom-into-crop when fit=true and forceCrop=false', () => {
        const s = cropPreviewStyle(SRC, { x: 0, y: 0, width: 50, height: 50, fit: 1 })
        expect(s.backgroundSize).toBe('200%')
        // top-left quadrant: pos = 0/(100-50)*100, 0/(100-50)*100 = 0% 0%
        expect(s.backgroundPosition).toBe('0% 0%')
        expect(s.backgroundRepeat).toBe('no-repeat')
    })

    it('positions the bottom-right quadrant correctly', () => {
        const s = cropPreviewStyle(SRC, { x: 50, y: 50, width: 50, height: 50 }, true)
        // pos = 50/(100-50)*100, 50/(100-50)*100 = 100% 100%
        expect(s.backgroundPosition).toBe('100% 100%')
    })

    it('positions a centered crop at 50% 50%', () => {
        const s = cropPreviewStyle(SRC, { x: 25, y: 25, width: 50, height: 50 }, true)
        expect(s.backgroundPosition).toBe('50% 50%')
    })

    it('handles full-image crop (w/h = 100) without divide-by-zero', () => {
        const s = cropPreviewStyle(SRC, { x: 0, y: 0, width: 100, height: 100 }, true)
        expect(s.backgroundSize).toBe('100%')
        // No room to scroll — position irrelevant; default to 0% 0%.
        expect(s.backgroundPosition).toBe('0% 0%')
    })

    it('clamps positions when crop x/y + w/h exceeds image bounds', () => {
        // Saved x=90, w=50 means crop extends beyond right edge — clamp
        // to 100% so the rightmost visible region is shown.
        const s = cropPreviewStyle(SRC, { x: 90, y: 90, width: 50, height: 50 }, true)
        expect(s.backgroundPosition).toBe('100% 100%')
    })

    // -------- Item 10: one-axis overflow --------
    // Spec: cropData with w > 100 OR h > 100 represents a square crop
    // larger than the image's smaller dimension; the renderer must
    // letterbox the image inside the container with padding bars on
    // the overflow axis. See `.claude/plans/item-10-crop-one-axis-overflow.md`.
    // Padding fill comes from CropImage's container background-color.

    it.todo('letterboxes vertically when crop height exceeds image (e.g. {x:0, y:-25, w:100, h:150})')
    it.todo('letterboxes horizontally when crop width exceeds image (e.g. {x:-25, y:0, w:150, h:100})')
    it.todo('handles offset overflow ({x:50, y:-10, w:50, h:120}) — half-image x + overflow y')
    it.todo('preserves negative x or y in backgroundPosition (no clamp to 0% when overflow is intentional)')
    it.todo('preserves x/y > 100-w in backgroundPosition (no clamp to 100% when overflow is intentional)')
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
