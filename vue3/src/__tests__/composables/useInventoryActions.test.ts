/**
 * Regression coverage for useInventoryActions.
 *
 * Characterization tests locking in addToInventory / quickAddToInventory /
 * removeFromInventory / ensureDefaultLocation / getDefaultLocation /
 * checkInventoryStatus. Asserts the exact API request shape the backend
 * expects (camelCase keys per OpenAPI-generated client) not just "was called".
 */
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
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

const t = (k: string, params?: Record<string, any>) => params ? `${k}(${JSON.stringify(params)})` : k

const LOC = {id: 3, name: 'Pantry', household: {id: 1, name: 'Home'}}
const FOOD = {id: 42, name: 'Butter'}

function makeActionConfirm(overrides: Partial<{confirmed: boolean; selectedIds: number[]; selectedValue: number | null}> = {}) {
    const selectedEntryIds = ref<number[]>(overrides.selectedIds ?? [])
    const selectedValue = ref<number | null>(overrides.selectedValue ?? null)
    return {
        open: vi.fn().mockResolvedValue(overrides.confirmed ?? true),
        setEntries: vi.fn(),
        setSelectOptions: vi.fn(),
        selectedEntryIds,
        selectedValue,
        reset: vi.fn(),
    } as any
}

function makeQuickAddDialog(result: any) {
    return {open: vi.fn().mockResolvedValue(result)} as any
}

describe('useInventoryActions', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    describe('addToInventory', () => {
        it('sends the full API payload shape with camelCase keys', async () => {
            apiMock.apiInventoryEntryCreate.mockResolvedValue({})
            const {addToInventory} = useInventoryActions()
            const ok = await addToInventory(FOOD, LOC, 2, {id: 7, name: 'tbsp'} as any)
            expect(ok).toBe(true)
            expect(apiMock.apiInventoryEntryCreate).toHaveBeenCalledWith({
                inventoryEntry: {
                    food: {id: 42, name: 'Butter'},
                    inventoryLocation: {id: 3, name: 'Pantry', household: {id: 1, name: 'Home'}},
                    unit: {id: 7, name: 'tbsp'},
                    amount: 2,
                },
            })
        })

        it('sends unit: null when not supplied (OpenAPI accepts null per TODO)', async () => {
            apiMock.apiInventoryEntryCreate.mockResolvedValue({})
            const {addToInventory} = useInventoryActions()
            await addToInventory(FOOD, LOC)
            const call = apiMock.apiInventoryEntryCreate.mock.calls[0][0]
            expect(call.inventoryEntry.unit).toBeNull()
            expect(call.inventoryEntry.amount).toBe(1)
        })

        it('clears the saved default location on 400', async () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = LOC as any
            apiMock.apiInventoryEntryCreate.mockRejectedValue({response: {status: 400}})

            const {addToInventory} = useInventoryActions()
            await expect(addToInventory(FOOD, LOC)).rejects.toBeDefined()
            expect(store.deviceSettings.food_defaultInventoryLocation).toBeNull()
        })

        it('clears the saved default location on 404', async () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = LOC as any
            apiMock.apiInventoryEntryCreate.mockRejectedValue({response: {status: 404}})

            const {addToInventory} = useInventoryActions()
            await expect(addToInventory(FOOD, LOC)).rejects.toBeDefined()
            expect(store.deviceSettings.food_defaultInventoryLocation).toBeNull()
        })

        it('propagates other errors without clearing the saved default', async () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = LOC as any
            apiMock.apiInventoryEntryCreate.mockRejectedValue({response: {status: 500}})

            const {addToInventory} = useInventoryActions()
            await expect(addToInventory(FOOD, LOC)).rejects.toBeDefined()
            expect(store.deviceSettings.food_defaultInventoryLocation).toEqual(LOC)
        })
    })

    describe('quickAddToInventory', () => {
        it('lists locations, prompts dialog, and saves selected as default', async () => {
            apiMock.apiInventoryLocationList.mockResolvedValue({
                results: [LOC, {id: 4, name: 'Freezer', household: {id: 1, name: 'Home'}}],
            })
            apiMock.apiInventoryEntryCreate.mockResolvedValue({})
            const dialog = makeQuickAddDialog({locationId: 4, amount: 3, unit: null})

            const {quickAddToInventory} = useInventoryActions()
            const ok = await quickAddToInventory(FOOD, dialog, t)

            expect(ok).toBe(true)
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_defaultInventoryLocation).toEqual({
                id: 4, name: 'Freezer', household: {id: 1, name: 'Home'},
            })
            expect(apiMock.apiInventoryEntryCreate).toHaveBeenCalledWith({
                inventoryEntry: expect.objectContaining({
                    food: {id: 42, name: 'Butter'},
                    inventoryLocation: expect.objectContaining({id: 4}),
                    amount: 3,
                    unit: null,
                }),
            })
        })

        it('returns false and emits error when there are no locations', async () => {
            apiMock.apiInventoryLocationList.mockResolvedValue({results: []})
            const dialog = makeQuickAddDialog({locationId: 1, amount: 1, unit: null})

            const {quickAddToInventory} = useInventoryActions()
            expect(await quickAddToInventory(FOOD, dialog, t)).toBe(false)
            expect(dialog.open).not.toHaveBeenCalled()
        })

        it('returns false when user cancels the dialog', async () => {
            apiMock.apiInventoryLocationList.mockResolvedValue({results: [LOC]})
            const dialog = makeQuickAddDialog(null)  // dialog cancelled

            const {quickAddToInventory} = useInventoryActions()
            expect(await quickAddToInventory(FOOD, dialog, t)).toBe(false)
            expect(apiMock.apiInventoryEntryCreate).not.toHaveBeenCalled()
        })
    })

    describe('removeFromInventory', () => {
        it('loads entries, opens confirm, and deletes selected on confirm', async () => {
            apiMock.apiInventoryEntryList.mockResolvedValue({
                results: [
                    {id: 10, amount: 2, unit: {name: 'kg'}, inventoryLocation: {name: 'Pantry'}, createdAt: '2026-04-17'},
                    {id: 11, amount: 1, unit: null, inventoryLocation: {name: 'Freezer'}},
                ],
            })
            apiMock.apiInventoryEntryDestroy.mockResolvedValue({})
            const dialog = makeActionConfirm({confirmed: true, selectedIds: [10, 11]})

            const {removeFromInventory} = useInventoryActions()
            const ok = await removeFromInventory(FOOD, dialog, t)

            expect(ok).toBe(true)
            expect(dialog.setEntries).toHaveBeenCalledTimes(1)
            const entries = dialog.setEntries.mock.calls[0][0]
            expect(entries).toHaveLength(2)
            expect(apiMock.apiInventoryEntryDestroy).toHaveBeenCalledTimes(2)
            expect(apiMock.apiInventoryEntryDestroy).toHaveBeenCalledWith({id: 10})
            expect(apiMock.apiInventoryEntryDestroy).toHaveBeenCalledWith({id: 11})
        })

        it('returns false on cancel and does not delete', async () => {
            apiMock.apiInventoryEntryList.mockResolvedValue({results: []})
            const dialog = makeActionConfirm({confirmed: false})
            const {removeFromInventory} = useInventoryActions()
            expect(await removeFromInventory(FOOD, dialog, t)).toBe(false)
            expect(apiMock.apiInventoryEntryDestroy).not.toHaveBeenCalled()
        })

        it('reports a DELETE error when some destroys fail', async () => {
            apiMock.apiInventoryEntryList.mockResolvedValue({results: [{id: 20}, {id: 21}]})
            apiMock.apiInventoryEntryDestroy
                .mockResolvedValueOnce({})
                .mockRejectedValueOnce(new Error('boom'))
            const dialog = makeActionConfirm({confirmed: true, selectedIds: [20, 21]})
            const {useMessageStore} = await import('@/stores/MessageStore')
            const addErrorSpy = vi.spyOn(useMessageStore(), 'addError')

            const {removeFromInventory} = useInventoryActions()
            await removeFromInventory(FOOD, dialog, t)
            expect(addErrorSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('ensureDefaultLocation', () => {
        it('returns true immediately when a valid default is already saved', async () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = LOC as any
            const dialog = makeActionConfirm({confirmed: true})

            const {ensureDefaultLocation} = useInventoryActions()
            expect(await ensureDefaultLocation(dialog, t)).toBe(true)
            expect(apiMock.apiInventoryLocationList).not.toHaveBeenCalled()
        })

        it('clears stale default (missing household) and re-fetches', async () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = {id: 1, name: 'Stale'} as any
            apiMock.apiInventoryLocationList.mockResolvedValue({results: [LOC]})
            const dialog = makeActionConfirm({confirmed: true})

            const {ensureDefaultLocation} = useInventoryActions()
            expect(await ensureDefaultLocation(dialog, t)).toBe(true)
            expect(store.deviceSettings.food_defaultInventoryLocation).toEqual({
                id: LOC.id, name: LOC.name, household: LOC.household,
            })
        })

        it('saves the only location as default when exactly one exists', async () => {
            apiMock.apiInventoryLocationList.mockResolvedValue({results: [LOC]})
            const dialog = makeActionConfirm({confirmed: true})

            const {ensureDefaultLocation} = useInventoryActions()
            expect(await ensureDefaultLocation(dialog, t)).toBe(true)
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_defaultInventoryLocation).toEqual({
                id: LOC.id, name: LOC.name, household: LOC.household,
            })
        })

        it('returns false with an info dialog when there are no locations', async () => {
            apiMock.apiInventoryLocationList.mockResolvedValue({results: []})
            const dialog = makeActionConfirm({confirmed: true})

            const {ensureDefaultLocation} = useInventoryActions()
            expect(await ensureDefaultLocation(dialog, t)).toBe(false)
            expect(dialog.open).toHaveBeenCalledTimes(1)
        })

        it('prompts for selection when multiple locations exist', async () => {
            const locA = {...LOC, id: 3}
            const locB = {...LOC, id: 4, name: 'Freezer'}
            apiMock.apiInventoryLocationList.mockResolvedValue({results: [locA, locB]})
            const dialog = makeActionConfirm({confirmed: true, selectedValue: 4})

            const {ensureDefaultLocation} = useInventoryActions()
            expect(await ensureDefaultLocation(dialog, t)).toBe(true)
            const store = useUserPreferenceStore()
            expect(store.deviceSettings.food_defaultInventoryLocation?.id).toBe(4)
            expect(dialog.setSelectOptions).toHaveBeenCalledWith([
                {value: 3, label: 'Pantry'},
                {value: 4, label: 'Freezer'},
            ])
        })
    })

    describe('getDefaultLocation', () => {
        it('returns the saved location when valid', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = LOC as any
            const {getDefaultLocation} = useInventoryActions()
            expect(getDefaultLocation()).toEqual(LOC)
        })

        it('clears + returns null when saved location lacks household', () => {
            const store = useUserPreferenceStore()
            store.deviceSettings.food_defaultInventoryLocation = {id: 1, name: 'Stale'} as any
            const {getDefaultLocation} = useInventoryActions()
            expect(getDefaultLocation()).toBeNull()
            expect(store.deviceSettings.food_defaultInventoryLocation).toBeNull()
        })
    })

    describe('checkInventoryStatus', () => {
        it('returns true when count > 0', async () => {
            apiMock.apiInventoryEntryList.mockResolvedValue({count: 5, results: []})
            const {checkInventoryStatus} = useInventoryActions()
            expect(await checkInventoryStatus(42)).toBe(true)
            expect(apiMock.apiInventoryEntryList).toHaveBeenCalledWith({foodId: 42, pageSize: 1})
        })

        it('returns false when count is 0', async () => {
            apiMock.apiInventoryEntryList.mockResolvedValue({count: 0, results: []})
            const {checkInventoryStatus} = useInventoryActions()
            expect(await checkInventoryStatus(42)).toBe(false)
        })

        it('returns false when the API throws', async () => {
            apiMock.apiInventoryEntryList.mockRejectedValue(new Error('boom'))
            const {checkInventoryStatus} = useInventoryActions()
            expect(await checkInventoryStatus(42)).toBe(false)
        })
    })
})
