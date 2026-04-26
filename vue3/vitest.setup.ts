import { vi } from 'vitest'

// KNOWN TEST DEBT: many component tests mount without registering Vuetify,
// so Vuetify components like <v-btn>, <v-chip>, <v-card> render as
// unresolved custom elements (no real behavior) and Vue logs "Failed to
// resolve component" warnings. Tests that pass this way are not exercising
// real component rendering — they're matching against literal element
// selectors like findAll('v-chip').
//
// Fixing this properly requires updating ~13 tests across KeywordsBar,
// AddToShoppingDialog, BooksPage, ModelMergeDialog, and RecipeContextMenu
// to either register Vuetify per-test or use proper component selectors.
// That refactor is out of scope here. For now we suppress the warnings to
// stop them flooding vitest's worker RPC channel during teardown — the
// flood (~4400 warnings per CI run) was triggering EnvironmentTeardownError
// and exiting CI non-zero even when all tests passed.
//
// TODO: register Vuetify globally via @vue/test-utils config and update
// the affected tests to query rendered Vuetify DOM (.v-chip class, etc.).
const _origWarn = console.warn
const _suppressed = [
    '[Vue warn]: Failed to resolve component',
    '[Vue Router warn]:',
    '[Vuetify UPGRADE]',
]
console.warn = (...args: unknown[]) => {
    const first = args[0]
    if (typeof first === 'string' && _suppressed.some(p => first.includes(p))) return
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
