import {acceptHMRUpdate, defineStore} from "pinia"
import {ApiApi, MealPlan} from "@/openapi";
import {computed, ref} from "vue";
import {DateTime} from "luxon";


const _STORE_ID = "meal_plan_store"
const _LOCAL_STORAGE_KEY = "MEAL_PLAN_CLIENT_SETTINGS"


export const useMealPlanStore = defineStore(_STORE_ID, () => {

    let plans = ref(new Map<number, MealPlan>)
    let currently_updating = ref([new Date(0), new Date(0)])
    let settings = ref({})

    const plan_list = computed(() => {
        let plan_list = [] as MealPlan[]

        plans.value.forEach((plan: MealPlan, key: number) => {
            plan_list.push(plan)
        })

        return plan_list
    })

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


    function refreshFromAPI(from_date: Date, to_date: Date) {
        if (currently_updating.value[0] !== from_date || currently_updating.value[1] !== to_date) {
            currently_updating.value = [from_date, to_date] // certainly no perfect check but better than nothing

            const api = new ApiApi()
            return api.apiMealPlanList({fromDate: DateTime.fromJSDate(from_date).toISODate() as string, toDate: DateTime.fromJSDate(to_date).toISODate() as string}).then(r => {
                r.forEach((p) => {
                    plans.value.set(p.id, p)
                })
                currently_updating.value = [new Date(0), new Date(0)]
            })
        }
        return new Promise(() => {
        })
    }

    function createOrUpdate(object: MealPlan) {
        if(object.id == undefined){
            return createObject(object)
        } else {
            return updateObject(object)
        }
    }

    function createObject(object: MealPlan) {
        const api = new ApiApi()
        return api.apiMealPlanCreate({mealPlanRequest: object}).then((r) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
            plans.value.set(r.id, r)
            return r
        }).catch((err) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
        })
    }

    function updateObject(object: MealPlan) {
        const api = new ApiApi()
        return api.apiMealPlanUpdate({id: object.id, mealPlanRequest: object}).then((r) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            plans.value.set(r.id, r)
        }).catch((err) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
        })
    }

    function deleteObject(object: MealPlan) {
        const api = new ApiApi()
        return api.apiMealPlanDestroy({id: object.id}).then((r) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
            plans.value.delete(object.id)
        }).catch((err) => {
            //StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
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
    return {plans, currently_updating, plan_list, refreshFromAPI, createObject, updateObject, deleteObject, createOrUpdate}
})

// enable hot reload for store
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMealPlanStore, import.meta.hot))
}