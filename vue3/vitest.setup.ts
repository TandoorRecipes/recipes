import { vi } from 'vitest'

// Suppress Vue resolve-component warnings.
//
// Many existing component tests mount with @vue/test-utils but do not register
// Vuetify globally, which produces a flood of "Failed to resolve component:
// v-btn" / v-card / v-row / etc. console.warn calls (~4000+ per CI run).
// Under CI load this floods vitest's worker RPC channel and surfaces as
// EnvironmentTeardownError ("Closing rpc while onUserConsoleLog was pending"),
// causing exit 1 even when all tests pass. The warnings themselves are
// harmless — Vuetify components render as their custom-element fallback —
// so silencing them is safe and removes the race surface.
const _origWarn = console.warn
console.warn = (...args: unknown[]) => {
    const first = args[0]
    if (typeof first === 'string' && first.includes('[Vue warn]: Failed to resolve component')) return
    _origWarn(...args)
}

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

// Mock ResizeObserver (used by Vuetify)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

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
