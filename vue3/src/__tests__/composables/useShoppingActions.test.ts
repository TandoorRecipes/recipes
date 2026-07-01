import {describe, it, expect, vi, beforeEach} from 'vitest'
import {createPinia, setActivePinia} from 'pinia'
import {ref} from 'vue'

import {apiMock, resetApiMock} from '../api-mock'

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: vi.fn(), replace: vi.fn()}),
}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (k: string) => k})}))
vi.mock('@vueuse/core', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    useStorage: (_k: string, d: any) => ref(d),
    useClipboard: () => ({copy: vi.fn(), copied: ref(false)}),
    useWakeLock: () => ({request: vi.fn(), release: vi.fn()}),
}))
vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
}))

import {useShoppingActions} from '@/composables/useShoppingActions'

describe('checkShoppingStatus', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    it('SH-02: passes checked=false so recently-completed entries are excluded', async () => {
        // Bug: without checked=false the endpoint returns unchecked AND recently-checked entries
        // (within shopping_recent_days window), making items look "on the shopping list" even
        // after being checked off.
        apiMock.apiShoppingListEntryList.mockResolvedValue({count: 0, results: []})
        const {checkShoppingStatus} = useShoppingActions()
        await checkShoppingStatus(42)
        expect(apiMock.apiShoppingListEntryList).toHaveBeenCalledWith(
            expect.objectContaining({checked: false})
        )
    })
})
