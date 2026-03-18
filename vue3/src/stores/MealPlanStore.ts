import {acceptHMRUpdate, defineStore} from "pinia"
import {ApiApi, MealPlan} from "@/openapi";
import {computed, ref} from "vue";
import {DateTime} from "luxon";
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";


const _STORE_ID = "meal_plan_store"
const _LOCAL_STORAGE_KEY = "MEAL_PLAN_CLIENT_SETTINGS"


export const useMealPlanStore = defineStore(_STORE_ID, () => {

    let plans = ref(new Map<number, MealPlan>)
    const selectedIds = ref(new Set<number>())
    let currently_updating = ref([new Date(0), new Date(0)])
    const loading = ref(false)
    let settings = ref({})

    const lastStartDate = ref(new Date())
    const lastEndDate = ref(new Date())

    const planList = computed(() => {
        let plan_list = [] as MealPlan[]

        plans.value.forEach((plan: MealPlan, key: number) => {
            plan_list.push(plan)
        })

        return plan_list
    })

    const selectedCount = computed(() => selectedIds.value.size)

    function isSelected(id: number | undefined) {
        return id !== undefined && selectedIds.value.has(id)
    }

    function setSelected(object: MealPlan, selected: boolean) {
        if (object.id == undefined) {
            return
        }
        if (selected) {
            selectedIds.value.add(object.id)
        } else {
            selectedIds.value.delete(object.id)
        }
    }

    function toggleSelection(object: MealPlan) {
        if (object.id == undefined) {
            return
        }
        if (selectedIds.value.has(object.id)) {
            selectedIds.value.delete(object.id)
        } else {
            selectedIds.value.add(object.id)
        }
    }

    function clearSelection() {
        selectedIds.value.clear()
    }

    const empty_meal_plan = computed(() => {
        return {
            from_date: null,
            to_date: null,
            id: -1,
            meal_type: null,
            note: "",
            note_markdown: "",
            recipe: null,
            servings: 1,
            shared: [],
            title: "",
            title_placeholder: "Title", // meal plan edit modal should be improved to not need this
        }
    })

    // const client_settings = computed(() => {
    //     if (this.settings === null) {
    //         this.settings = this.loadClientSettings()
    //     }
    //     return this.settings
    // })

    /**
     * based on the last API refresh period, refresh the meal plan list
     */
    function refreshLastUpdatedPeriod() {
        refreshFromAPI(lastStartDate.value, lastEndDate.value)
    }

    function refreshFromAPI(from_date: Date, to_date: Date) {
        if (currently_updating.value[0] !== from_date || currently_updating.value[1] !== to_date) {
            lastStartDate.value = from_date
            lastEndDate.value = to_date

            currently_updating.value = [from_date, to_date] // certainly no perfect check but better than nothing
            loading.value = true
            plans.value = new Map<number, MealPlan>()
            selectedIds.value.clear()
            return recLoadMealPlans(from_date, to_date)
        }
        return new Promise(() => {
        })
    }

    function recLoadMealPlans(from_date: Date, to_date: Date, page: number = 1): Promise<any> {
        const api = new ApiApi()
        return api.apiMealPlanList({
            fromDate: DateTime.fromJSDate(from_date).toISODate() as string,
            toDate: DateTime.fromJSDate(to_date).toISODate() as string,
            pageSize: 100,
            page: page
        }).then(r => {
            r.results.forEach((p) => {
                plans.value.set(p.id!, p)
            })

            if (r.next) {
                return recLoadMealPlans(from_date, to_date, page + 1)
            } else {
                loading.value = false
                currently_updating.value = [new Date(0), new Date(0)]
            }

        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
        })
    }

    function createOrUpdate(object: MealPlan) {
        if (object.id == undefined) {
            return createObject(object)
        } else {
            return updateObject(object)
        }
    }

    function createObject(object: MealPlan) {
        const api = new ApiApi()
        loading.value = true
        return api.apiMealPlanCreate({mealPlan: object}).then((r) => {
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
            plans.value.set(r.id!, r)
            return r
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

    function updateObject(object: MealPlan) {
        const api = new ApiApi()
        return api.apiMealPlanUpdate({id: object.id!, mealPlan: object}).then((r) => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            plans.value.set(r.id!, r)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        })
    }

    function deleteObject(object: MealPlan) {
        const api = new ApiApi()
        loading.value = true
        return api.apiMealPlanDestroy({id: object.id!}).then((r) => {
            useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS)
            plans.value.delete(object.id!)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

    function _mealPlanOverlapsRange(mp: MealPlan, rangeStart: DateTime, rangeEnd: DateTime): boolean {
        const mpStart = DateTime.fromJSDate(mp.fromDate).toLocal().startOf('day')
        const mpEnd = mp.toDate ? DateTime.fromJSDate(mp.toDate).toLocal().startOf('day') : mpStart
        return mpStart <= rangeEnd && mpEnd >= rangeStart
    }

    function bulkDeleteSelected() {
        const idsToDelete = Array.from(selectedIds.value)
        if (idsToDelete.length === 0) {
            return
        }

        const api = new ApiApi()
        loading.value = true

        return api.apiMealPlanBulkDelete({ids: idsToDelete}).then((r) => {
            useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS, r)
            idsToDelete.forEach((id) => plans.value.delete(id))
            clearSelection()
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

    function bulkDeleteDateRange(fromDate: Date, toDate: Date) {
        const api = new ApiApi()
        loading.value = true

        const rangeStart = DateTime.fromJSDate(fromDate).toLocal().startOf('day')
        const rangeEnd = DateTime.fromJSDate(toDate).toLocal().startOf('day')

        const requestFrom = rangeStart.toISO()
        const requestTo = rangeEnd.toISO()

        return api.apiMealPlanBulkDelete({fromDate: requestFrom as string, toDate: requestTo as string}).then((r) => {
            // Optimistically remove overlapping meal plans from the local cache
            const idsToDelete: number[] = []
            plans.value.forEach((mp: MealPlan, id: number) => {
                if (_mealPlanOverlapsRange(mp, rangeStart, rangeEnd)) {
                    idsToDelete.push(id)
                }
            })

            idsToDelete.forEach((id) => plans.value.delete(id))
            clearSelection()
            useMessageStore().addPreparedMessage(PreparedMessage.DELETE_SUCCESS, r)
        }).catch((err) => {
            useMessageStore().addError(ErrorMessageType.DELETE_ERROR, err)
        }).finally(() => {
            loading.value = false
        })
    }

    // function updateClientSettings(settings) {
    //     this.settings = settings
    //     localStorage.setItem(_LOCAL_STORAGE_KEY, JSON.stringify(this.settings))
    // }
    //
    // function loadClientSettings() {
    //     let s = localStorage.getItem(_LOCAL_STORAGE_KEY)
    //     if (s === null) {
    //         return {
    //             displayPeriodUom: "week",
    //             displayPeriodCount: 3,
    //             startingDayOfWeek: 1,
    //             displayWeekNumbers: true,
    //         }
    //     } else {
    //         return JSON.parse(s)
    //     }
    // }
    return {
        plans,
        selectedIds,
        currently_updating,
        planList,
        selectedCount,
        loading,
        refreshFromAPI,
        createObject,
        updateObject,
        deleteObject,
        refreshLastUpdatedPeriod,
        createOrUpdate,
        isSelected,
        setSelected,
        toggleSelection,
        clearSelection,
        bulkDeleteSelected,
        bulkDeleteDateRange,
    }
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMealPlanStore, import.meta.hot))
}