import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { makeMealPlan } from '@/__tests__/factories'
import { apiMock, resetApiMock } from '@/__tests__/api-mock'

vi.mock('@/openapi', async (importOriginal) => ({
    ...(await importOriginal<any>()),
    ApiApi: class { constructor() { return apiMock } },
    ResponseError: class extends Error { response: any; constructor(r: any) { super(); this.response = r } },
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('vuetify', () => ({
    useTheme: () => ({ change: vi.fn() }),
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('@vueuse/router', () => ({
    useRouteQuery: () => ({ value: false }),
}))

vi.mock('@vueuse/core', async () => {
    const { ref } = await import('vue')
    return {
        useStorage: (_key: string, defaultValue: any) => ref(defaultValue),
    }
})

import { useMealPlanStore } from '@/stores/MealPlanStore'

describe('MealPlanStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        resetApiMock()
    })

    describe('initial state', () => {
        it('starts with empty plans', () => {
            const store = useMealPlanStore()
            expect(store.plans.size).toBe(0)
        })

        it('starts not loading', () => {
            const store = useMealPlanStore()
            expect(store.loading).toBe(false)
        })

        it('planList is empty computed', () => {
            const store = useMealPlanStore()
            expect(store.planList).toEqual([])
        })
    })

    describe('refreshFromAPI', () => {
        it('loads meal plans into store', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: 1 })

            apiMock.apiMealPlanList.mockResolvedValue({
                results: [plan],
                count: 1,
                next: null,
            })

            await store.refreshFromAPI(new Date('2026-03-01'), new Date('2026-03-07'))

            expect(store.plans.size).toBe(1)
            expect(store.plans.get(1)).toEqual(plan)
            expect(store.loading).toBe(false)
        })

        it('planList reflects loaded plans', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: 5, title: 'Dinner' })

            apiMock.apiMealPlanList.mockResolvedValue({
                results: [plan],
                count: 1,
                next: null,
            })

            await store.refreshFromAPI(new Date('2026-03-01'), new Date('2026-03-07'))

            expect(store.planList).toHaveLength(1)
            expect(store.planList[0].title).toBe('Dinner')
        })
    })

    describe('createObject', () => {
        it('adds plan to store on success', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: undefined })
            const created = makeMealPlan({ id: 10 })

            apiMock.apiMealPlanCreate.mockResolvedValue(created)

            const result = await store.createObject(plan)

            expect(result).toEqual(created)
            expect(store.plans.get(10)).toEqual(created)
            expect(store.loading).toBe(false)
        })
    })

    describe('updateObject', () => {
        it('updates plan in store on success', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: 3, title: 'Updated' })

            apiMock.apiMealPlanUpdate.mockResolvedValue(plan)

            await store.updateObject(plan)

            expect(store.plans.get(3)).toEqual(plan)
        })
    })

    describe('deleteObject', () => {
        it('removes plan from store on success', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: 7 })
            store.plans.set(7, plan)

            apiMock.apiMealPlanDestroy.mockResolvedValue(undefined)

            await store.deleteObject(plan)

            expect(store.plans.has(7)).toBe(false)
            expect(store.loading).toBe(false)
        })
    })

    describe('createOrUpdate', () => {
        it('calls createObject when id is undefined', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: undefined })
            const created = makeMealPlan({ id: 20 })

            apiMock.apiMealPlanCreate.mockResolvedValue(created)

            await store.createOrUpdate(plan)

            expect(apiMock.apiMealPlanCreate).toHaveBeenCalled()
            expect(apiMock.apiMealPlanUpdate).not.toHaveBeenCalled()
        })

        it('calls updateObject when id is present', async () => {
            const store = useMealPlanStore()
            const plan = makeMealPlan({ id: 3 })

            apiMock.apiMealPlanUpdate.mockResolvedValue(plan)

            await store.createOrUpdate(plan)

            expect(apiMock.apiMealPlanUpdate).toHaveBeenCalled()
            expect(apiMock.apiMealPlanCreate).not.toHaveBeenCalled()
        })
    })
})
