import { vi } from 'vitest'

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

// Mock IntersectionObserver (used by Vuetify v-intersect and VProgressLinear)
class MockIntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    constructor(_callback: any, _options?: any) {}
}
global.IntersectionObserver = MockIntersectionObserver as any
