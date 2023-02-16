import {defineStore} from 'pinia'
import {ApiApiFactory} from "@/utils/openapi/api";
import moment from "moment/moment";


const _STORE_ID = 'meal_plan_store'

/*
* test store to play around with pinia and see if it can work for my usecases
* dont trust that all mealplans are in store as there is no cache validation logic, its just a shared data holder
* */
export const useMealPlanStore = defineStore(_STORE_ID, {
    state: () => ({
        plans: [] //TODO convert to dict and add translation functions for easy editing
    }),
    getters: {
        plan_list() {
            let plan_list = []
            for (let key in this.plans) {
                plan_list.push(this.plans[key]);
            }
        }
    },
    actions: {
        refreshFromAPI(from_date, to_date) {
            let options = {
                query: {
                    from_date: from_date,
                    to_date: to_date,
                },
            }

            let apiClient = new ApiApiFactory()

            apiClient.listMealPlans(options).then(r => {
                this.plans = r.data
            })
        },
    },
})