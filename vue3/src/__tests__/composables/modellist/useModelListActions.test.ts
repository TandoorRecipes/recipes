/**
 * Regression coverage for useModelListActions.
 *
 * Characterization tests for the action registry + executeAction dispatch
 * (toggle via handler, toggle via optimistic-update + rollback, route
 * navigation, plain handler, fallback onAction). Labeled regression coverage.
 */
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {computed, ref} from 'vue'
import {createPinia, setActivePinia} from 'pinia'

const routerPush = vi.fn()

vi.mock('vue-router', () => ({
    useRoute: () => ({query: {}}),
    useRouter: () => ({push: routerPush, replace: vi.fn()}),
}))
vi.mock('@vueuse/router', () => ({useRouteQuery: (_k: string, d: any) => ref(d)}))
vi.mock('vue-i18n', () => ({useI18n: () => ({t: (k: string) => k})}))

import {useModelListActions} from '@/composables/modellist/useModelListActions'
import type {ActionDef, ModelItem} from '@/composables/modellist/types'

function setup(actions: ActionDef[], hooks: Partial<{
    onAction: (key: string, item: ModelItem) => void
    onToggleComplete: (item: ModelItem, field: string) => void
    onReload: () => void
}> = {}) {
    const model = computed(() => ({actionDefs: actions} as any))
    const gmUpdate = vi.fn().mockResolvedValue({})
    const genericModel = ref({update: gmUpdate} as any)
    const modelName = ref('food')
    const h = useModelListActions(
        model as any,
        genericModel,
        modelName,
        hooks.onAction,
        hooks.onToggleComplete,
        hooks.onReload,
    )
    return {...h, gmUpdate}
}

describe('useModelListActions', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        routerPush.mockReset()
    })

    describe('actionDefs + groupedActionDefs', () => {
        it('exposes actionDefs from model.actionDefs', () => {
            const actions: ActionDef[] = [
                {key: 'edit', labelKey: 'Edit', group: 'Row'} as any,
                {key: 'delete', labelKey: 'Delete', group: 'Row', isDanger: true} as any,
            ]
            const {actionDefs} = setup(actions)
            expect(actionDefs.value).toEqual(actions)
        })

        it('groups action defs by `group` key', () => {
            const a: ActionDef[] = [
                {key: 'x', labelKey: 'X', group: 'A'} as any,
                {key: 'y', labelKey: 'Y', group: 'A'} as any,
                {key: 'z', labelKey: 'Z', group: 'B'} as any,
                {key: 'u', labelKey: 'U'} as any,  // undefined group
            ]
            const {groupedActionDefs} = setup(a)
            expect(groupedActionDefs.value.get('A')?.map(d => d.key)).toEqual(['x', 'y'])
            expect(groupedActionDefs.value.get('B')?.map(d => d.key)).toEqual(['z'])
            expect(groupedActionDefs.value.get('')?.map(d => d.key)).toEqual(['u'])
        })
    })

    describe('getToggleState', () => {
        it('prefers action.isActive when provided', () => {
            const def: ActionDef = {key: 'k', labelKey: 'K', isToggle: true, isActive: (i: any) => i.customFlag === 'on'} as any
            const {getToggleState} = setup([def])
            expect(getToggleState(def, {id: 1, customFlag: 'on'} as any)).toBe(true)
            expect(getToggleState(def, {id: 1, customFlag: 'off'} as any)).toBe(false)
        })

        it('falls back to item[toggleField] when no isActive', () => {
            const def: ActionDef = {key: 'k', labelKey: 'K', isToggle: true, toggleField: 'onhand'} as any
            const {getToggleState} = setup([def])
            expect(getToggleState(def, {id: 1, onhand: true} as any)).toBe(true)
            expect(getToggleState(def, {id: 1, onhand: false} as any)).toBe(false)
        })

        it('returns false when there is no toggleField and no isActive', () => {
            const def: ActionDef = {key: 'k', labelKey: 'K', isToggle: true} as any
            const {getToggleState} = setup([def])
            expect(getToggleState(def, {id: 1} as any)).toBe(false)
        })
    })

    describe('executeAction — toggle via handler', () => {
        it('calls the handler and onToggleComplete when the handler changed the field', async () => {
            const handler = vi.fn(async (item: ModelItem) => { item.onhand = !item.onhand })
            const onToggleComplete = vi.fn()
            const def: ActionDef = {
                key: 'toggle', labelKey: 'T', isToggle: true, toggleField: 'onhand', handler,
            } as any
            const {executeAction} = setup([def], {onToggleComplete})
            const item: ModelItem = {id: 1, onhand: false} as any
            await executeAction('toggle', item)
            expect(handler).toHaveBeenCalledWith(item, expect.any(Object), undefined)
            expect(onToggleComplete).toHaveBeenCalledWith(item, 'onhand')
            expect(item.onhand).toBe(true)
        })

        it('does NOT emit success when the handler left the field unchanged', async () => {
            const handler = vi.fn(async () => { /* no-op */ })
            const def: ActionDef = {
                key: 'toggle', labelKey: 'T', isToggle: true, toggleField: 'onhand', handler,
            } as any
            const {executeAction} = setup([def])
            const {useMessageStore, PreparedMessage} = await import('@/stores/MessageStore')
            const spy = vi.spyOn(useMessageStore(), 'addPreparedMessage')
            await executeAction('toggle', {id: 1, onhand: true} as any)
            expect(spy).not.toHaveBeenCalledWith(PreparedMessage.UPDATE_SUCCESS)
        })

        it('routes handler errors through MessageStore.addError', async () => {
            const def: ActionDef = {
                key: 'toggle', labelKey: 'T', isToggle: true, toggleField: 'onhand',
                handler: vi.fn().mockRejectedValue(new Error('boom')),
            } as any
            const {executeAction} = setup([def])
            const {useMessageStore, ErrorMessageType} = await import('@/stores/MessageStore')
            const addError = vi.spyOn(useMessageStore(), 'addError')
            await executeAction('toggle', {id: 1, onhand: false} as any)
            expect(addError).toHaveBeenCalledWith(ErrorMessageType.UPDATE_ERROR, expect.any(Error))
        })
    })

    describe('executeAction — toggle without handler (optimistic update)', () => {
        it('flips the field optimistically and calls genericModel.update with the cleaned payload', async () => {
            const def: ActionDef = {
                key: 'toggle', labelKey: 'T', isToggle: true, toggleField: 'onhand',
            } as any
            const {executeAction, gmUpdate} = setup([def])
            const item: ModelItem = {id: 7, onhand: false, name: 'X', _tempFlag: 'strip-me'} as any
            await executeAction('toggle', item)
            expect(item.onhand).toBe(true)
            // _-prefixed fields stripped
            const [id, payload] = gmUpdate.mock.calls[0]
            expect(id).toBe(7)
            expect(payload).not.toHaveProperty('_tempFlag')
            expect(payload.name).toBe('X')
            expect(payload.onhand).toBe(true)
        })

        it('rolls back the optimistic flip when update() rejects', async () => {
            const def: ActionDef = {
                key: 'toggle', labelKey: 'T', isToggle: true, toggleField: 'onhand',
            } as any
            const {executeAction, gmUpdate} = setup([def])
            gmUpdate.mockRejectedValueOnce(new Error('server rejected'))
            const item: ModelItem = {id: 3, onhand: false} as any
            await executeAction('toggle', item)
            expect(item.onhand).toBe(false)  // rolled back
        })
    })

    describe('executeAction — route navigation', () => {
        it('calls router.push with resolved name/params/query', async () => {
            const def: ActionDef = {
                key: 'edit',
                labelKey: 'Edit',
                routeName: 'ModelEditPage',
                routeParams: (item: ModelItem, name: string) => ({model: name, id: item.id}),
                routeQuery: (item: ModelItem) => ({from: 'list', id: String(item.id)}),
            } as any
            const {executeAction} = setup([def])
            await executeAction('edit', {id: 99} as any)
            expect(routerPush).toHaveBeenCalledWith({
                name: 'ModelEditPage',
                params: {model: 'food', id: 99},
                query: {from: 'list', id: '99'},
            })
        })

        it('defaults params to {} and query to undefined when resolvers are missing', async () => {
            const def: ActionDef = {key: 'n', labelKey: 'N', routeName: 'SomePage'} as any
            const {executeAction} = setup([def])
            await executeAction('n', {id: 1} as any)
            expect(routerPush).toHaveBeenCalledWith({
                name: 'SomePage', params: {}, query: undefined,
            })
        })
    })

    describe('executeAction — handler-only, fallback onAction', () => {
        it('awaits plain handler, emits success, and calls onReload when reloadAfterAction is true', async () => {
            const handler = vi.fn().mockResolvedValue({})
            const onReload = vi.fn()
            const def: ActionDef = {
                key: 'refresh', labelKey: 'R', handler, reloadAfterAction: true,
            } as any
            const {executeAction} = setup([def], {onReload})
            await executeAction('refresh', {id: 1} as any)
            expect(handler).toHaveBeenCalledTimes(1)
            expect(onReload).toHaveBeenCalledTimes(1)
        })

        it('does NOT call onReload when reloadAfterAction is falsy', async () => {
            const onReload = vi.fn()
            const def: ActionDef = {key: 'h', labelKey: 'H', handler: vi.fn().mockResolvedValue({})} as any
            const {executeAction} = setup([def], {onReload})
            await executeAction('h', {id: 1} as any)
            expect(onReload).not.toHaveBeenCalled()
        })

        it('falls back to onAction hook when action has no handler/route/toggle', async () => {
            const onAction = vi.fn()
            const def: ActionDef = {key: 'fallback', labelKey: 'F'} as any
            const {executeAction} = setup([def], {onAction})
            const item: ModelItem = {id: 5} as any
            await executeAction('fallback', item)
            expect(onAction).toHaveBeenCalledWith('fallback', item)
        })

        it('is a no-op when the key is not in actionDefs', async () => {
            const onAction = vi.fn()
            const {executeAction, gmUpdate} = setup([], {onAction})
            await executeAction('unknown', {id: 1} as any)
            expect(onAction).not.toHaveBeenCalled()
            expect(gmUpdate).not.toHaveBeenCalled()
            expect(routerPush).not.toHaveBeenCalled()
        })
    })
})
