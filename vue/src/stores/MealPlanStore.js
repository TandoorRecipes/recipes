import {defineStore} from 'pinia'
import {ApiApiFactory} from "@/utils/openapi/api";

const _STORE_ID = 'meal_plan_store'
import Vue from "vue"
/*
* test store to play around with pinia and see if it can work for my usecases
* dont trust that all mealplans are in store as there is no cache validation logic, its just a shared data holder
* */
export const useMealPlanStore = defineStore(_STORE_ID, {
    state: () => ({
        plans: {},
        currently_updating: null,
    }),
    getters: {
        plan_list: function () {
            let plan_list = []
            for (let key in this.plans) {
                plan_list.push(this.plans[key]);
            }
            return plan_list
        }
    },
    actions: {
        refreshFromAPI(from_date, to_date) {
            if (this.currently_updating !== [from_date, to_date]) {
                this.currently_updating = [from_date, to_date] // certainly no perfect check but better than nothing

                let options = {
                    query: {
                        from_date: from_date,
                        to_date: to_date,
                    },
                }

                let apiClient = new ApiApiFactory()
                apiClient.listMealPlans(options).then(r => {
                    r.data.forEach((p) => {
                        Vue.set(this.plans, p.id, p)
                    })
                    this.currently_updating = null
                })
            }

        },
    },
})