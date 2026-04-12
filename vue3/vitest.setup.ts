import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import vuetify from '@/vuetify'

// Register the production Vuetify instance for every test. Tests get the
// same component set, theme, icon aliases, and defaults the production app
// uses — so assertions can query rendered Vuetify DOM (`.v-chip`,
// `.v-list-item-title`, etc.) and selectors mean what they mean in production.
//
// Browser-API polyfills below cover the jsdom gaps Vuetify relies on at
// runtime (matchMedia, ResizeObserver, IntersectionObserver). Without them
// Vuetify mounts but throws on first reactive layout call.
config.global.plugins = [...(config.global.plugins ?? []), vuetify]


// Mock window.matchMedia (used by breakpoint_utils and Vuetify)
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

// Mock ResizeObserver (used by Vuetify and @vueuse/core useResizeObserver).
// Must be a class — @vueuse/core invokes it via `new ResizeObserver(...)`,
// and arrow-function-backed vi.fn().mockImplementation(...) is not constructable.
class MockResizeObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback?: any) {}
}
global.ResizeObserver = MockResizeObserver as any

// Mock window.print (used by RecipeViewPage)
window.print = vi.fn()

// Mock window.scrollTo — jsdom doesn't implement it, so any code path that
// calls it (Vuetify VOverlay, page navigation handlers, etc.) prints
// "Not implemented: Window's scrollTo() method" to stderr. The mock keeps
// that output clean without changing behavior.
window.scrollTo = vi.fn() as any

// Mock IntersectionObserver (used by Vuetify v-intersect and VProgressLinear)
class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback: any, _options?: any) {}
}
global.IntersectionObserver = MockIntersectionObserver as any

// Mock visualViewport (used by Vuetify VOverlay locationStrategies).
// jsdom doesn't implement visualViewport, causing unhandled ReferenceError
// that CI treats as a test failure even when all tests pass.
Object.defineProperty(window, 'visualViewport', {
    writable: true,
    value: {
        width: 1340,
        height: 800,
        offsetLeft: 0,
        offsetTop: 0,
        pageLeft: 0,
        pageTop: 0,
        scale: 1,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    },
})
