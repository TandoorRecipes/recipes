/**
 * Regression coverage for useShoppingActions.
 *
 * Characterization tests for the three exported action handlers.
 * Labeled regression coverage — code already ships; these lock in
 * current behavior + the API request shape the backend contract
 * depends on (camelCase keys per the generated OpenAPI client).
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

import {useShoppingActions} from '@/composables/useShoppingActions'

const t = (k: string, params?: Record<string, any>) => params ? `${k}(${JSON.stringify(params)})` : k

function makeConfirmDialog(overrides: Partial<{
    confirmed: boolean
    selectedIds: number[]
}> = {}) {
    const selectedEntryIds = ref<number[]>(overrides.selectedIds ?? [])
    const openMock = vi.fn().mockResolvedValue(overrides.confirmed ?? true)
    const setEntriesMock = vi.fn()
    return {
        open: openMock,
        setEntries: setEntriesMock,
        selectedEntryIds,
        reset: vi.fn(),
    } as any
}

describe('useShoppingActions', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    describe('addToShopping', () => {
        it('calls apiShoppingListEntryCreate with the exact payload shape the backend expects', async () => {
            apiMock.apiShoppingListEntryCreate.mockResolvedValue({})
            const {addToShopping} = useShoppingActions()
            const ok = await addToShopping({id: 42, name: 'Butter'}, 2, {id: 7, name: 'tbsp'} as any)
            expect(ok).toBe(true)
            expect(apiMock.apiShoppingListEntryCreate).toHaveBeenCalledWith({
                shoppingListEntry: {
                    food: {id: 42, name: 'Butter'},
                    amount: 2,
                    unit: {id: 7, name: 'tbsp'},
                },
            })
        })

        it('defaults amount to 1 and omits unit when not supplied', async () => {
            apiMock.apiShoppingListEntryCreate.mockResolvedValue({})
            const {addToShopping} = useShoppingActions()
            await addToShopping({id: 1, name: 'Salt'})
            expect(apiMock.apiShoppingListEntryCreate).toHaveBeenCalledWith({
                shoppingListEntry: {
                    food: {id: 1, name: 'Salt'},
                    amount: 1,
                    unit: undefined,
                },
            })
        })
    })

    describe('removeFromShopping', () => {
        it('opens confirm dialog, loads unchecked entries, and deletes selected on confirm', async () => {
            apiMock.apiShoppingListEntryList.mockResolvedValue({
                results: [
                    {id: 10, checked: false, amount: 2, unit: {name: 'tbsp'}, createdBy: {displayName: 'Alice'}, createdAt: '2026-04-17T10:00:00Z'},
                    {id: 11, checked: true},  // checked entries are filtered out
                    {id: 12, checked: false, amount: 1, unit: null},
                ],
                count: 3,
            })
            apiMock.apiShoppingListEntryDestroy.mockResolvedValue({})
            const dialog = makeConfirmDialog({confirmed: true, selectedIds: [10, 12]})

            const {removeFromShopping} = useShoppingActions()
            const ok = await removeFromShopping({id: 42, name: 'Butter'}, dialog, t)

            expect(ok).toBe(true)
            // Only unchecked entries populated for selection
            expect(dialog.setEntries).toHaveBeenCalledTimes(1)
            const entries = dialog.setEntries.mock.calls[0][0]
            expect(entries).toHaveLength(2)
            expect(entries.map((e: any) => e.id)).toEqual([10, 12])
            // Both selected entries deleted
            expect(apiMock.apiShoppingListEntryDestroy).toHaveBeenCalledTimes(2)
            expect(apiMock.apiShoppingListEntryDestroy).toHaveBeenCalledWith({id: 10})
            expect(apiMock.apiShoppingListEntryDestroy).toHaveBeenCalledWith({id: 12})
        })

        it('returns false and does not delete when user cancels', async () => {
            apiMock.apiShoppingListEntryList.mockResolvedValue({results: [], count: 0})
            const dialog = makeConfirmDialog({confirmed: false})

            const {removeFromShopping} = useShoppingActions()
            const ok = await removeFromShopping({id: 1, name: 'X'}, dialog, t)

            expect(ok).toBe(false)
            expect(apiMock.apiShoppingListEntryDestroy).not.toHaveBeenCalled()
        })

        it('reports an error via MessageStore when some deletions fail', async () => {
            apiMock.apiShoppingListEntryList.mockResolvedValue({
                results: [{id: 20, checked: false}, {id: 21, checked: false}],
                count: 2,
            })
            apiMock.apiShoppingListEntryDestroy
                .mockResolvedValueOnce({})
                .mockRejectedValueOnce(new Error('boom'))
            const dialog = makeConfirmDialog({confirmed: true, selectedIds: [20, 21]})

            const {useMessageStore} = await import('@/stores/MessageStore')
            const addErrorSpy = vi.spyOn(useMessageStore(), 'addError')

            const {removeFromShopping} = useShoppingActions()
            const ok = await removeFromShopping({id: 42, name: 'Butter'}, dialog, t)

            expect(ok).toBe(true)
            expect(addErrorSpy).toHaveBeenCalledTimes(1)
        })

        it('falls back to empty entries when the list API throws', async () => {
            apiMock.apiShoppingListEntryList.mockRejectedValue(new Error('network'))
            const dialog = makeConfirmDialog({confirmed: false})
            const {removeFromShopping} = useShoppingActions()
            await removeFromShopping({id: 1, name: 'X'}, dialog, t)
            expect(dialog.setEntries).toHaveBeenCalledWith([])
        })
    })

    describe('checkShoppingStatus', () => {
        it('returns true when there is at least one unchecked entry', async () => {
            apiMock.apiShoppingListEntryList.mockResolvedValue({count: 3, results: []})
            const {checkShoppingStatus} = useShoppingActions()
            expect(await checkShoppingStatus(42)).toBe(true)
            expect(apiMock.apiShoppingListEntryList).toHaveBeenCalledWith({food: 42, pageSize: 1})
        })

        it('returns false when count is zero', async () => {
            apiMock.apiShoppingListEntryList.mockResolvedValue({count: 0, results: []})
            const {checkShoppingStatus} = useShoppingActions()
            expect(await checkShoppingStatus(42)).toBe(false)
        })

        it('returns false when the API throws', async () => {
            apiMock.apiShoppingListEntryList.mockRejectedValue(new Error('boom'))
            const {checkShoppingStatus} = useShoppingActions()
            expect(await checkShoppingStatus(42)).toBe(false)
        })
    })
})
