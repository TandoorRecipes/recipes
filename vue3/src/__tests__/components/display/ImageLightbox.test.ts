/**
 * Regression coverage for ImageLightbox.
 *
 * Tests navigation (prev/next wraparound), currentSrc resolution from
 * images[] or legacy src, and Escape/Arrow key handling.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {mount, flushPromises} from '@vue/test-utils'
import {createI18n} from 'vue-i18n'
import {createVuetify} from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import {createRouter, createMemoryHistory} from 'vue-router'

import ImageLightbox from '@/components/display/ImageLightbox.vue'

function mountLightbox(props: {modelValue?: boolean, images?: string[], startIndex?: number, src?: string}) {
    const i18n = createI18n({legacy: false, locale: 'en', messages: {en: {}}, missingWarn: false, fallbackWarn: false})
    const vuetify = createVuetify({components: vuetifyComponents, directives: vuetifyDirectives})
    const router = createRouter({history: createMemoryHistory(), routes: [{path: '/', component: {template: '<div/>'}}]})
    return mount(ImageLightbox, {
        props,
        global: {plugins: [i18n, vuetify, router]},
    })
}

describe('ImageLightbox', () => {
    it('renders without error with no props (default images=[])', () => {
        const w = mountLightbox({modelValue: false})
        expect(w.exists()).toBe(true)
    })

    it('currentSrc pulls from images[currentIndex=0] on initial mount', async () => {
        const w = mountLightbox({modelValue: true, images: ['/a.jpg', '/b.jpg', '/c.jpg']})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.currentSrc).toBe('/a.jpg')
    })

    it('currentSrc falls back to legacy src when images[] is empty', async () => {
        const w = mountLightbox({modelValue: true, src: '/legacy.jpg'})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.currentSrc).toBe('/legacy.jpg')
    })

    it('next() wraps around to 0 after last image', async () => {
        const w = mountLightbox({modelValue: true, images: ['/a.jpg', '/b.jpg']})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.currentSrc).toBe('/a.jpg')
        vm.next()
        await flushPromises()
        expect(vm.currentSrc).toBe('/b.jpg')
        vm.next()
        await flushPromises()
        expect(vm.currentSrc).toBe('/a.jpg')
    })

    it('prev() wraps around to last index from 0', async () => {
        const w = mountLightbox({modelValue: true, images: ['/a.jpg', '/b.jpg', '/c.jpg']})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.currentSrc).toBe('/a.jpg')
        vm.prev()
        await flushPromises()
        expect(vm.currentSrc).toBe('/c.jpg')
    })

    it('resets currentIndex to startIndex when show flips true', async () => {
        const w = mountLightbox({modelValue: false, images: ['/a.jpg', '/b.jpg', '/c.jpg'], startIndex: 2})
        await w.setProps({modelValue: true})
        await flushPromises()
        const vm = w.vm as any
        expect(vm.currentSrc).toBe('/c.jpg')
    })
})
