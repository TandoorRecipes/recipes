import { vi, afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import { vuetifyOptions } from '@/vuetify'
import type { App } from 'vue'

// Register a Vuetify instance with production options PLUS all components and
// directives for every test. Production uses vite-plugin-vuetify's autoImport
// to register components on demand from templates — vitest's bundle doesn't
// run that plugin, so we register everything explicitly here. Tests get the
// same theme, icon aliases, locale, and defaults as production, with full
// component coverage.
//
// Browser-API polyfills below cover jsdom gaps Vuetify relies on at runtime
// (matchMedia, ResizeObserver, IntersectionObserver). Without them Vuetify
// mounts but throws on first reactive layout call.
const testVuetify = createVuetify({
    ...vuetifyOptions,
    components: vuetifyComponents,
    directives: vuetifyDirectives,
})

// Capture Vue runtime errors per test. `expect(w.exists()).toBe(true)` is true
// even when a component logged a Vue runtime error during render — its job is
// to verify mount didn't throw, not that rendering succeeded. This plugin
// installs an app-level errorHandler that records exceptions, and afterEach
// fails the test if any were captured. Tests that legitimately exercise
// error paths can clear the buffer with vueErrors.length = 0.
export const vueErrors: Array<{ err: unknown; info: string }> = []
const errorTrackerPlugin = {
    install(app: App) {
        app.config.errorHandler = (err, _instance, info) => {
            vueErrors.push({ err, info })
        }
    },
}

config.global.plugins = [...(config.global.plugins ?? []), testVuetify, errorTrackerPlugin]

afterEach(() => {
    if (vueErrors.length > 0) {
        const captured = [...vueErrors]
        vueErrors.length = 0
        const lines = captured.map((e, i) => {
            const message = e.err instanceof Error ? e.err.message : String(e.err)
            return `  [${i + 1}] (${e.info}) ${message}`
        })
        throw new Error(`Vue runtime error(s) during test:\n${lines.join('\n')}`)
    }
})


Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock ResizeObserver (used by Vuetify). Must be a class, not an arrow
// factory — Vuetify's source TS calls `new ResizeObserver(...)` and
// vitest inlines vuetify source so `vi.fn().mockImplementation(() => ({}))`
// is rejected as "not a constructor".
class MockResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback: any) {}
}
global.ResizeObserver = MockResizeObserver as any

window.print = vi.fn()

// Mock window.scrollTo — jsdom doesn't implement it, so any code path that
// calls it (Vuetify VOverlay, page navigation handlers, etc.) prints
// "Not implemented: Window's scrollTo() method" to stderr. The mock keeps
// that output clean without changing behavior.
window.scrollTo = vi.fn() as any

class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback: any, _options?: any) {}
}
global.IntersectionObserver = MockIntersectionObserver as any

// Mock window.visualViewport — jsdom doesn't implement it. Vuetify's
// number-scaler dialog reads visualViewport for keyboard-aware positioning.
;(window as any).visualViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}
