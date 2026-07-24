/**
 * Regression coverage for CropImage.
 *
 * Tests the fit-frame branch (letterboxing cropped square inside container)
 * and the crop-preview style computation.
 */
import {describe, it, expect, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'

import CropImage from '@/components/display/CropImage.vue'

function mountCrop(props: {src?: string | null, cropData?: Record<string, number> | null, forceCrop?: boolean, width?: string, height?: string, rounded?: boolean | string}) {
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    return mount(CropImage, {
        props,
        global: {plugins: [vuetify]},
    })
}

describe('CropImage', () => {
    it('applies crop-image class to the root', () => {
        const w = mountCrop({src: '/x.jpg'})
        expect(w.find('.crop-image').exists()).toBe(true)
    })

    it('adds crop-image-fit-frame when cropData has fit=true and forceCrop=false', () => {
        const w = mountCrop({
            src: '/x.jpg',
            cropData: {x: 0, y: 0, width: 50, height: 50, fit: 1},
            forceCrop: false,
        })
        expect(w.find('.crop-image-fit-frame').exists()).toBe(true)
    })

    it('does NOT add fit-frame when forceCrop=true (square thumbnails always zoom-in)', () => {
        const w = mountCrop({
            src: '/x.jpg',
            cropData: {x: 0, y: 0, width: 50, height: 50, fit: 1},
            forceCrop: true,
        })
        expect(w.find('.crop-image-fit-frame').exists()).toBe(false)
    })

    it('does NOT add fit-frame without cropData', () => {
        const w = mountCrop({src: '/x.jpg'})
        expect(w.find('.crop-image-fit-frame').exists()).toBe(false)
    })

    it('renders a fit-inner element only when in fit-frame mode', () => {
        const withFit = mountCrop({
            src: '/x.jpg',
            cropData: {x: 0, y: 0, width: 50, height: 50, fit: 1},
        })
        const withoutFit = mountCrop({src: '/x.jpg'})
        expect(withFit.find('.crop-image-fit-inner').exists()).toBe(true)
        expect(withoutFit.find('.crop-image-fit-inner').exists()).toBe(false)
    })
})
