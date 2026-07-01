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

import {useInventoryActions} from '@/composables/useInventoryActions'

const LOCATIONS = [{id: 1, name: 'Kitchen', household: {id: 1, name: 'Home'}}]

describe('manageInventory', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    it('ICM-01: calls dialog.openManage with the food id', async () => {
        apiMock.apiInventoryLocationList.mockResolvedValue({results: LOCATIONS})
        const mockDialog = {openManage: vi.fn().mockResolvedValue({hasEntries: true})}
        const {manageInventory} = useInventoryActions()
        await manageInventory({id: 42, name: 'Flour'}, mockDialog as any, (k: string) => k)
        expect(mockDialog.openManage).toHaveBeenCalledWith(
            expect.objectContaining({foodId: 42})
        )
    })

    it('ICM-01: returns true when dialog reports hasEntries=true', async () => {
        apiMock.apiInventoryLocationList.mockResolvedValue({results: LOCATIONS})
        const mockDialog = {openManage: vi.fn().mockResolvedValue({hasEntries: true})}
        const {manageInventory} = useInventoryActions()
        const result = await manageInventory({id: 42, name: 'Flour'}, mockDialog as any, (k: string) => k)
        expect(result).toBe(true)
    })

    it('ICM-01: returns false when dialog reports hasEntries=false', async () => {
        apiMock.apiInventoryLocationList.mockResolvedValue({results: LOCATIONS})
        const mockDialog = {openManage: vi.fn().mockResolvedValue({hasEntries: false})}
        const {manageInventory} = useInventoryActions()
        const result = await manageInventory({id: 42, name: 'Flour'}, mockDialog as any, (k: string) => k)
        expect(result).toBe(false)
    })
})
